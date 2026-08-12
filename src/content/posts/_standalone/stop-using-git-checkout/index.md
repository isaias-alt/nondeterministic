---
title: "Why you should stop using git checkout"
description: "It's time to embrace clearer and more specific Git commands"
pubDate: "2025-02-11"
# updatedDate: (optional, not set - post hasn't been revised since publishing)
draft: false
# cover: (optional, no cover image for this post)
# series: (optional, this post is standalone, not part of a series)
# order: (optional, only used when `series` is set)
---

Sometimes I wonder if the tools we use every day could be simpler. Git, for instance, is like that universal remote trying to control all your devices at once, it ends up being so flexible that you second-guess yourself every time you press a button. And if there's one command in Git that perfectly exemplifies this situation, it's `git checkout`.

![Git](./git-1.webp)

## The art of doing too much

Imagine trying to explain how `git checkout` works to someone. It's like describing a Swiss Army knife to someone who's never seen one. "Well, you use this part for cutting, but if you turn it this way it's a screwdriver, and if you open it like that...". The command does so many different things that its purpose becomes diluted:

```bash
# Switch branches
git checkout main

# Restore a file
git checkout -- file.txt

# Create a new branch
git checkout -b feature/new-functionality

# Switch to a specific commit
git checkout a1b2c3d
```

It's as if we had a tool trying to solve all our problems at once, but in the process, it makes us think too hard about how to use it correctly.

## A lesson from the past

Have you heard about the _Unix philosophy_? It's like those unwritten rules in the kitchen that make everything work better. Each utensil has its specific purpose. Unix developers got this right in the 70s: "Make each program do one thing and do it well". It's like having a knife for cutting and a whisk for mixing, instead of one appliance trying to do both things mediocrely.

This idea isn't just a historical relic, it's why we still use many Unix tools decades later. When each piece of software has a clear purpose, it's like having a well-organized toolbox where you know exactly where everything is and what it's for.

## Simplifying our tools

Git evolved to embrace this clarity. It's like organizing your kitchen and separating utensils by function, suddenly, everything makes more sense. This is how `git switch` and `git reset` were born.

### `git switch`: The branch specialist

First we have `git switch`, this command is like having a dedicated GPS in the car instead of using a map that also serves as an umbrella. His only job is managing branches:

```bash
# Switch to main branch
git switch main

# Create and switch to a new branch
git switch -c feature/new-functionality
```

When you read this command, there's no room for misinterpretation.

### `git restore`: The recovery master

On the other hand, `git restore` is like having a specific "undo" button for your files. No ambiguity, no confusion, it does exactly what its name suggests:

```bash
# Discard changes in a file
git restore file.txt

# Remove a file from the staging area
git restore --staged file.txt
```

Isn't it comforting to have a command that does exactly what you expect it to do?

## The value of clarity

You might think: "But `git checkout` works, why change?" It's like keeping that old universal remote when you could have specific controls for each device. Clarity isn't just an aesthetic preference, it's an investment in the quality of our daily work.

When we use commands with a clear purpose:

- Our code flows more naturally
- Errors are easier to prevent
- Teamwork becomes more fluid
- New developers learn faster

## A small change, big impact

The transition is simpler than it seems. It's like learning to use the right keyboard shortcuts, it requires conscious effort at first, but soon becomes natural:

```bash
# Before
git checkout main
git checkout -b new-branch
git checkout -- file.txt
git checkout HEAD file.txt
```

```bash
# Now
git switch main
git switch -c new-branch
git restore file.txt
git restore --source=HEAD file.txt
```

## Building better habits

The change in our tools reflects an evolution in how we think about software development. Every time you choose to use `git switch` or `git restore` instead of `git checkout`, you're opting for clarity and specificity. It's like choosing the right utensil for each task in the kitchen, the end result is simply better.

Next time you're about to type `git checkout`, pause for a moment. Think about what you really want to achieve. Clarity in our commands leads to clarity in our code, and that's something we can all appreciate.

### Additional resources

- [Official git checkout documentation](https://git-scm.com/docs/git-checkout)
- [Official git switch documentation](https://git-scm.com/docs/git-switch)
- [Official git restore documentation](https://git-scm.com/docs/git-restore)
- [What is Unix Philosophy?](https://en.wikipedia.org/wiki/Unix_philosophy)
