// The theme picker owns the palette; the status bar displays its current name.
const label = document.getElementById('status-theme');

if (label) {
  const root = document.documentElement;
  const choices = Array.from(document.querySelectorAll<HTMLElement>('[data-theme-preset]'));

  function updateLabel() {
    const theme = root.dataset.theme ?? 'github';
    const preset = choices.find((choice) => choice.dataset.themePreset === theme);
    const name = preset?.textContent?.trim() ?? (theme === 'custom' ? 'Custom' : theme);
    label!.textContent = name;
  }

  updateLabel();
  new MutationObserver(updateLabel).observe(root, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}
