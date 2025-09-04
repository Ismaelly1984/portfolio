// Pega o ID da URL (?id=1)
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"), 10);

fetch("articles.json")
  .then(res => {
    if (!res.ok) throw new Error("Erro ao carregar JSON");
    return res.json();
  })
  .then(data => {
    const container = document.getElementById("article-content");

    // Caso id seja inválido ou não exista
    if (!id || isNaN(id)) {
      container.innerHTML = `
        <h2>Artigo não encontrado</h2>
        <p>Volte ao <a href="blog.html">blog</a> para explorar outros artigos.</p>
      `;
      return;
    }

    const article = data.find(a => a.id === id);

    if (!article) {
      container.innerHTML = `
        <h2>Artigo não encontrado</h2>
        <p>Volte ao <a href="blog.html">blog</a> para explorar outros artigos.</p>
      `;
      return;
    }

    // Atualiza o título da aba dinamicamente
    document.title = `${article.title} | Ismael Nunes - Blog`;

    // Renderiza artigo
    container.innerHTML = `
      <header class="article-header">
        <h1 class="article-title">${article.title}</h1>
        <p class="article-meta">${article.date} · ${article.readTime}</p>
      </header>

      <img src="${article.image}" alt="${article.title}" class="article-cover" loading="lazy" />

      <div class="article-body">
        ${article.content}
      </div>

      <footer class="article-footer">
        <div class="tags">
          ${article.tags.map(tag => `<span class="tag">#${tag}</span>`).join(" ")}
        </div>
        <a href="blog.html" class="btn btn-primary">← Voltar ao Blog</a>
      </footer>
    `;
  })
  .catch(err => {
    console.error("Erro ao carregar artigo:", err);
    document.getElementById("article-content").innerHTML = `
      <p>Erro ao carregar o artigo. Tente novamente mais tarde.</p>
      <a href="blog.html" class="btn btn-primary">← Voltar ao Blog</a>
    `;
  });
