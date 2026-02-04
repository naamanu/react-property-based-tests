import type {
  Command,
  CommandConfig,
  CommandSequenceResult,
} from '../types/commands.js';
import type { Gen } from '../types/index.js';
import { createRandom } from '../generators/random.js';
import { gen } from '../generators/gen.js';
import { integer } from '../generators/primitives.js';

const DEFAULT_CONFIG: Required<CommandConfig> = {
  minCommands: 1,
  maxCommands: 20,
  numRuns: 50,
  maxShrinks: 100,
  seed: Date.now(),
};

/**
 * Generate a sequence of valid commands
 */
export function commandSequence<Model, System>(
  initialModel: Model,
  commands: Gen<Command<Model, System>>[],
  config: { minLength?: number; maxLength?: number } = {}
): Gen<Command<Model, System>[]> {
  const minLength = config.minLength ?? 1;
  const maxLength = config.maxLength ?? 20;

  return integer(minLength, maxLength + 1).flatMap((length) =>
    gen((random) => {
      const sequence: Command<Model, System>[] = [];
      let currentModel = initialModel;

      for (let i = 0; i < length; i++) {
        // Filter commands that are valid in current state
        const validCommands = commands.filter((cmdGen) => {
          const cmd = cmdGen.generate(random.clone());
          return cmd.check(currentModel);
        });

        if (validCommands.length === 0) {
          // No valid commands, stop here
          break;
        }

        // Pick a random valid command
        const cmdGen = validCommands[random.nextInt(0, validCommands.length)];
        const cmd = cmdGen.generate(random);

        sequence.push(cmd);
        currentModel = cmd.nextState(currentModel);
      }

      return sequence;
    })
  );
}

/**
 * Execute a command sequence and verify the system matches the model
 */
export async function runCommandSequence<Model, System>(
  initialModel: Model,
  system: System,
  commands: Command<Model, System>[]
): Promise<CommandSequenceResult> {
  let model = initialModel;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];

    try {
      // Execute command on system
      await command.run(system);

      // Update model
      model = command.nextState(model);

      // Verify system matches model
      const isValid = await command.verify(model, system);
      if (!isValid) {
        return {
          success: false,
          failedAt: i,
          commands: commands.map((c) => c.toString()),
          error: new Error(
            `Verification failed after command: ${command.toString()}`
          ),
          modelState: model,
        };
      }
    } catch (error) {
      return {
        success: false,
        failedAt: i,
        commands: commands.map((c) => c.toString()),
        error: error instanceof Error ? error : new Error(String(error)),
        modelState: model,
      };
    }
  }

  return {
    success: true,
    commands: commands.map((c) => c.toString()),
  };
}

/**
 * Run property-based testing with command sequences
 */
export async function forAllCommands<Model, System>(
  initialModel: Model,
  createSystem: () => System | Promise<System>,
  commands: Gen<Command<Model, System>>[],
  config: CommandConfig = {}
): Promise<CommandSequenceResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const random = createRandom(cfg.seed);

  const sequenceGen = commandSequence(initialModel, commands, {
    minLength: cfg.minCommands,
    maxLength: cfg.maxCommands,
  });

  for (let i = 0; i < cfg.numRuns; i++) {
    const testRandom = random.clone();
    const commandSeq = sequenceGen.generate(testRandom);

    const system = await createSystem();
    const result = await runCommandSequence(initialModel, system, commandSeq);

    if (!result.success) {
      return {
        ...result,
        commands: commandSeq.map((c) => c.toString()),
      };
    }
  }

  return { success: true };
}

/**
 * Create a command-based property test for use with test runners
 */
export function commandProperty<Model, System>(
  initialModel: Model,
  createSystem: () => System | Promise<System>,
  commands: Gen<Command<Model, System>>[],
  config?: CommandConfig
): () => Promise<void> {
  return async () => {
    const result = await forAllCommands(
      initialModel,
      createSystem,
      commands,
      config
    );

    if (!result.success) {
      const error =
        result.error || new Error('Command sequence property test failed');

      if (result.commands) {
        error.message += `\n\nFailing command sequence:\n${result.commands
          .map((cmd, i) => `${i + 1}. ${cmd}`)
          .join('\n')}`;

        if (result.failedAt !== undefined) {
          error.message += `\n\nFailed at command ${result.failedAt + 1}`;
        }
      }

      if (result.modelState) {
        error.message += `\n\nModel state:\n${JSON.stringify(
          result.modelState,
          null,
          2
        )}`;
      }

      throw error;
    }
  };
}
