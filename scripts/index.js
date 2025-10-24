async function renderAllTemplates() {
  const nodes = document.querySelectorAll('[data-template].render-monoblok');

  for (const node of nodes) {
    const templateName = node.dataset.template;
    try {
      const res = await fetch(`templates/${templateName}.html`);
      if (!res.ok) {
        console.error(`Не удалось загрузить шаблон "${templateName}"`);
        continue;
      }

      let html = await res.text();

      for (const [key, value] of Object.entries(node.dataset)) {
        if (key === 'template') continue;

        let processedValue = value.trim();

        // --- 1️⃣ HTML-файл ---
        if (processedValue.endsWith('.html')) {
          try {
            const htmlRes = await fetch(processedValue);
            if (htmlRes.ok) {
              processedValue = await htmlRes.text();
            } else {
              processedValue = `<span class="error">Ошибка загрузки ${processedValue}</span>`;
            }
          } catch {
            processedValue = `<span class="error">Не удалось загрузить ${processedValue}</span>`;
          }
        }

        // --- 2️⃣ Изображение ---
        else if (/\.(png|jpe?g|gif|webp|svg)$/i.test(processedValue)) {
          processedValue = `<img src="${processedValue}" alt="${key}" class="template-img">`;
        }

        // --- 3️⃣ Колонки ---
        else if (processedValue.includes(';')) {
          const columns = processedValue.split(';').map(c => c.trim()).filter(Boolean);

          const columnsHtml = columns.map(col => {
            const items = col.split('|').map(i => i.trim()).filter(Boolean);

            const listHtml = items.map(item => {
              if (item.includes('>')) {
                const [main, sublistRaw] = item.split('>').map(p => p.trim());
                const subItems = sublistRaw
                  .split(',')
                  .map(s => `<li>${s.trim()}</li>`)
                  .join('');
                return `<li>${main}<ul>${subItems}</ul></li>`;
              } else {
                return `<li>${item}</li>`;
              }
            }).join('');

            return `<ul class="features-column">${listHtml}</ul>`;
          }).join('');

          processedValue = `<div class="features-grid">${columnsHtml}</div>`;
        }

        // --- 4️⃣ Обычный список ---
        else if (processedValue.includes('|')) {
          const items = processedValue.split('|').map(i => i.trim()).filter(Boolean);

          const listHtml = items.map(item => {
            if (item.includes('>')) {
              const [main, sublistRaw] = item.split('>').map(p => p.trim());
              const subItems = sublistRaw
                .split(',')
                .map(s => `<li>${s.trim()}</li>`)
                .join('');
              return `<li>${main}<ul>${subItems}</ul></li>`;
            } else {
              return `<li>${item}</li>`;
            }
          }).join('');

          processedValue = `<ul class="features-column">${listHtml}</ul>`;
        }

        html = html.replaceAll(`{{${key}}}`, processedValue);
      }

      node.innerHTML = html;

    } catch (err) {
      console.error(err);
    }
  }
}

renderAllTemplates();