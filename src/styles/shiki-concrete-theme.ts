import type { ThemeRegistrationRaw } from 'shiki';

const concreteTheme: ThemeRegistrationRaw = {
  name: 'concrete',
  type: 'dark',
  colors: {
    'editor.background': '#16191d',
    'editor.foreground': '#cfd3d8'
  },
  settings: [
    {
      settings: { foreground: '#cfd3d8', background: '#16191d' }
    },
    {
      scope: ['comment'],
      settings: { foreground: '#6b7178', fontStyle: 'italic' }
    },
    {
      scope: ['string', 'string.quoted', 'string.template', 'string.regexp'],
      settings: { foreground: '#c9d67b' }
    },
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'support.function',
        'entity.name.function',
        'meta.function-call',
        'entity.name.tag'
      ],
      settings: { foreground: '#e0a45c' }
    },
    {
      scope: [
        'keyword',
        'storage.type',
        'storage.modifier',
        'keyword.control',
        'keyword.operator.new',
        'variable.language'
      ],
      settings: { foreground: '#7b9dbe' }
    },
    {
      scope: [
        'punctuation',
        'meta.brace',
        'punctuation.definition.tag',
        'punctuation.separator',
        'punctuation.terminator'
      ],
      settings: { foreground: '#8a9099' }
    },
    {
      scope: ['variable', 'variable.other', 'variable.parameter', 'support.type.property-name'],
      settings: { foreground: '#cfd3d8' }
    }
  ]
};

export default concreteTheme;
