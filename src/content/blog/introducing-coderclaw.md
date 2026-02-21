---
title: "Introducing CoderClaw"
description: "Introducing CoderClaw—an intelligent coding assistant that runs on your machine."
date: 2026-01-29
author: "Peter Steinberger"
authorHandle: "steipete"
tags: ["announcement", "roadmap"]
image: "/blog/coderclaw-logo-text.png"
---

Two months ago, I hacked together a weekend project. What started as "Code Assistant" now has over 100,000 GitHub stars and drew 2 million visitors in a single week.

Today, I'm thrilled to introduce **CoderClaw**.

The name captures what this project has become:

- **Coder**: For developers, by developers—a coding assistant in your workflow
- **Claw**: Our lobster heritage, a nod to where we came from

## What CoderClaw Is

CoderClaw is an intelligent coding assistant that runs on your machine and integrates seamlessly into your development environment. Whether you're in your IDE, terminal, or code review platform, your AI coding partner is right there with you.

**Your coding assistant. Your machine. Your rules.**

Unlike cloud-based coding assistants where your code lives on someone else's servers, CoderClaw runs where you choose—laptop, homelab, or private server. Your infrastructure. Your keys. Your code security.

## What's New in This Release

Along with the rebrand, we're shipping:

- **New Channels**: Twitch and Google Chat plugins
- **Models**: Support for KIMI K2.5 & Xiaomi MiMo-V2-Flash
- **Web Chat**: Send images just like you can in messaging apps
- **Security**: 34 security-related commits to harden the codebase

I'd like to thank all security folks for their hard work in helping us harden the project. We've released <a href="https://github.com/vignesh07/coderclaw-formal-models" target="_blank" rel="noopener">machine-checkable security models</a> this week and are continuing to work on additional security improvements. Remember that prompt injection is still an industry-wide unsolved problem, so it's important to use strong models and to study our <a href="https://docs.coderclaw.ai/gateway/security" target="_blank" rel="noopener">security best practices</a>.

## The Road Ahead

What's next? Security remains our top priority. We're also focused on gateway reliability and adding polish plus support for more models and providers.

This project has grown far beyond what I could maintain alone. Over the last few days I've worked on adding maintainers and we're slowly setting up processes so we can deal with the insane influx of PRs and Issues. I'm also figuring out how to pay maintainers properly—full-time if possible. If you wanna help, consider <a href="https://github.com/seanhogg/coderclaw/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">contributing</a> or <a href="https://github.com/sponsors/seanhogg" target="_blank" rel="noopener">sponsoring the org</a>.

## Thank You

To the Claw Crew—every clawtributor who's shipped code, filed issues, joined our Discord, or just tried the project: thank you. You are what makes CoderClaw special.

Welcome to CoderClaw.

---

*Get started: <a href="https://coderclaw.ai" target="_blank" rel="noopener">coderclaw.ai</a>*

*Join the Claw Crew: <a href="https://discord.gg/coderclaw" target="_blank" rel="noopener">Discord</a>*

*Star on GitHub: <a href="https://github.com/seanhogg/coderclaw" target="_blank" rel="noopener">github.com/seanhogg/coderclaw</a>*

— Peter

P.S. Yes, the mascot is still a lobster. Some things are sacred. 🦞
