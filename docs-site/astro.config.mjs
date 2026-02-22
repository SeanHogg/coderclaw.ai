import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://docs.coderclaw.ai',
  integrations: [
    starlight({
      title: 'CoderClaw',
      description: 'Self-hosted AI coding assistant with multi-channel messaging',
      logo: {
        light: './src/assets/coderclaw-logo-text.png',
        dark: './src/assets/coderclaw-logo-text-dark.png',
        replacesTitle: true,
      },
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/SeanHogg/coderClaw' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/coderclaw' },
      ],
      customCss: ['./src/styles/custom.css'],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        'zh-cn': { label: '中文 (简体)', lang: 'zh-CN' },
        ja: { label: '日本語', lang: 'ja' },
      },
      sidebar: [
        { label: 'Get Started', autogenerate: { directory: 'start' } },
        { label: 'Install', autogenerate: { directory: 'install' } },
        { label: 'Channels', autogenerate: { directory: 'channels' } },
        { label: 'Agents', autogenerate: { directory: 'concepts' } },
        { label: 'Tools', autogenerate: { directory: 'tools' } },
        { label: 'Models', autogenerate: { directory: 'providers' } },
        { label: 'Platforms', autogenerate: { directory: 'platforms' } },
        { label: 'Gateway', autogenerate: { directory: 'gateway' } },
        { label: 'CLI', autogenerate: { directory: 'cli' } },
        { label: 'Reference', autogenerate: { directory: 'reference' } },
        { label: 'Help', autogenerate: { directory: 'help' } },
      ],
      editLink: {
        baseUrl:
          'https://github.com/SeanHogg/coderclaw.ai/edit/main/docs-site/src/content/docs/',
      },
    }),
  ],
});
