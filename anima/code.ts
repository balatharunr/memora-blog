// This plugin will generate a sample codegen plugin
// that appears in the Element tab of the Inspect panel.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This provides the callback to generate the code.
figma.codegen.on('generate', (event) => {
  const code = `{
    name: '${event.node.name}'
  }`;
  return [
    {
      language: 'PLAINTEXT',
      code: code,
      title: 'Codegen Plugin',
    },
  ];
});
