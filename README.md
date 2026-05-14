<h1 align="center">
  A<sup>3</sup>
</h1>

<h3 align="center">
  Dynamic Execution Commitment of Vision-Language-Action Models
</h3>

<hr>

A<sup>3</sup> introduces **Adaptive Action Acceptance**, a self-speculative
verification mechanism for deciding how many actions a Vision-Language-Action
(VLA) policy should execute before replanning.

Modern VLA policies often predict a chunk of future low-level actions in a
single forward pass. Executing a fixed number of those actions is efficient, but
it is brittle: easy free-space motion can tolerate longer commitments, while
contact-rich stages often need frequent visual feedback. A<sup>3</sup> makes
the execution horizon state-dependent by verifying the longest reliable action
prefix under the current observation.

<p align="center">
  <a href="https://arxiv.org/abs/2605.11567">
    <img src="https://img.shields.io/badge/arXiv-2605.11567-b31b1b" alt="arXiv">
  </a>
  <a href="https://inceptionwang.github.io/A3/">
    <img src="https://img.shields.io/badge/Project-Page-0c6b68" alt="Project Page">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-Apache--2.0-3d4b52" alt="License: Apache-2.0">
  </a>
</p>

## Highlights

- **54% longer average commitment** on pi-0.5 LIBERO, increasing the execution
  length from 6.3 to 9.7 actions while improving average success.
- **+10.2 success gain** under the strongest observation corruption settings.
- **84.6% real-world average success** across FlipMug, TapeBox, HangMug, and
  StackCube without task-specific horizon tuning.

## Method

A<sup>3</sup> treats a predicted action chunk as a speculative draft and accepts
only the longest verified prefix.

1. **Mode-aware trajectory consensus**
   Samples candidate action chunks and scores agreement in induced trajectory
   space rather than raw action space.
2. **Consensus-ordered conditional invariance**
   Re-decodes lower-consensus actions conditioned on higher-consensus actions to
   test whether they remain stable under the model's own plan.
3. **Prefix-closed sequential consistency**
   Accepts only a continuous verified prefix so the committed rollout remains
   causally executable.

## Repository Layout

```text
docs/                         Project page source for GitHub Pages
examples/embodiment/          Evaluation entrypoints and configs
requirements/                 Environment setup scripts
rlinf/                        RLinf-based training/evaluation code
ray_utils/                    Ray startup utilities
```

The primary entrypoints are:

- `examples/embodiment/pipe.sh`
- `examples/embodiment/eval_embodiment.sh`
- `examples/embodiment/eval_embodied_agent.py`

## Installation

Install `uv`, then create the runtime environment for the model and benchmark
you want to run.

```bash
cd /path/to/A3
```

OpenPI + LIBERO / ManiSkill:

```bash
bash requirements/install.sh embodied --model openpi --env maniskill_libero
```

OpenPI + MetaWorld:

```bash
bash requirements/install.sh embodied --model openpi --env metaworld
```

GR00T + LIBERO / ManiSkill:

```bash
bash requirements/install.sh embodied --model gr00t --env maniskill_libero
```

If the machine does not provide `sudo`, or the required system dependencies are
already installed, add `--no-root`:

```bash
bash requirements/install.sh embodied --model openpi --env maniskill_libero --no-root
```

The default virtual environment directory is `.venv`. You can override it with
`--venv <dir>`:

```bash
bash requirements/install.sh embodied --model gr00t --env maniskill_libero --venv gr00t-libero
```

`examples/embodiment/pipe.sh` activates `./.venv` by default. If you choose a
different environment directory, activate it manually or adjust the launcher.

## Weights

For pi-0.5 on LIBERO:

- Official `openpi` repository:
  [Physical-Intelligence/openpi](https://github.com/Physical-Intelligence/openpi)
- Official JAX-to-PyTorch conversion workflow:
  `Converting JAX Models to PyTorch` in the `openpi` repository
- Converted PyTorch checkpoint:
  [INCEPTIONwang/pi05_pytorch](https://huggingface.co/INCEPTIONwang/pi05_pytorch)
- Expected local path:
  `models/pi05_pytorch`

Other checkpoints used by this repository are hosted under:

- [RLinf on Hugging Face](https://huggingface.co/RLinf)

If your checkpoint directory differs from the default, override
`actor.model.model_path` and `rollout.model.model_path` from the command line.

## Evaluation

`examples/embodiment/pipe.sh` is a collection of launch recipes, not a single
self-contained benchmark script. Different blocks target different models, task
suites, and execution settings. Prepare the matching environment and checkpoint
before running a command.

Typical usage is to keep only the target command uncommented in `pipe.sh`, or to
run `eval_embodiment.sh` directly.

```bash
bash examples/embodiment/eval_embodiment.sh libero_spatial_grpo_openpi_pi05-50sp

bash examples/embodiment/eval_embodiment.sh metaworld_50_ppo_openpi_pi05-5base

bash examples/embodiment/eval_embodiment.sh libero_spatial_ppo_gr00t-5base
```

The launcher executes:

```bash
python examples/embodiment/eval_embodied_agent.py \
  --config-path examples/embodiment/config \
  --config-name <CONFIG_NAME> \
  ...
```

## Common Runtime Overrides

All arguments after the config name are Hydra overrides.

- `runner.logger.log_path=<dir>`: set the log directory.
- `env.eval.total_num_envs=<n>`: control evaluation environment parallelism.
- `env.eval.max_episode_steps=<n>`: limit evaluation episode length.
- `env.eval.max_steps_per_rollout_epoch=<n>`: limit rollout work per evaluation epoch.
- `algorithm.eval_rollout_epoch=<n>`: set the number of evaluation rollout epochs.
- `env.eval.video_cfg.save_video=False`: disable video saving.
- `actor.global_batch_size=<n>`: reduce memory usage for local runs.
- `actor.model.model_path=<path>`: override the actor checkpoint path.
- `rollout.model.model_path=<path>`: override the rollout checkpoint path.
- `actor.model.openpi.enable_speculative=True|False`: enable or disable A<sup>3</sup>.
- `actor.model.openpi.eval_action_horizon=<n>`: set the baseline committed horizon.
- `actor.model.openpi.spec_delta_thresholds=[...]`: adjust verification thresholds.

## Citation

```bibtex
@article{chen2026dynamic,
  title={Dynamic Execution Commitment of Vision-Language-Action Models},
  author={Chen, Feng and Wang, Xianghui and Chen, Yuxuan and Li, Boying and He, Yefei and Zhang, Zeyu and Wu, Yicheng},
  journal={arXiv preprint arXiv:2605.11567},
  year={2026}
}
```

## Acknowledgement

This project uses RLinf as its underlying reinforcement learning infrastructure.
See [RLinf/RLinf](https://github.com/RLinf/RLinf) for the upstream system.
