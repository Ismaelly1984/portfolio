// post.js – Artigo individual otimizado
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"), 10);

// Função para montar imagens responsivas
function buildResponsiveImage(src, alt, sizes = ["400", "600", "800"]) {
  const name = src.replace(/\.(jpg|jpeg|png|webp)$/i, ""); // remove extensão caso venha
  const webpSrcSet = sizes.map(s => `${name}-${s}.webp ${s}w`).join(", ");
  const jpgSrcSet = sizes.map(s => `${name}-${s}.jpg ${s}w`).join(", ");

  return `
    <picture>
      <source type="image/webp" srcset="${webpSrcSet}" sizes="(max-width: 768px) 100vw, 800px">
      <source type="image/jpeg" srcset="${jpgSrcSet}" sizes="(max-width: 768px) 100vw, 800px">
      <img src="${name}-400.jpg" 
           alt="${alt}" 
           class="article-cover" 
           loading="lazy" 
           decoding="async" 
           width="800" 
           height="450">
    </picture>
  `;
}

fetch("articles.json")
  .then(res => {
    if (!res.ok) throw new Error("Erro ao carregar JSON");
    return res.json();
  })
  .then(data => {
    const container = document.getElementById("article-content");

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

    // Atualiza <title> e meta tags
    document.title = `${article.title} | Ismael Nunes - Blog`;
    const desc = article.description || article.excerpt;
    const url = `${location.origin}${location.pathname}?id=${id}`;
    const imageBase = article.image || "images/placeholder";

    // Open Graph
    const ogTags = [
      { property: "og:title", content: article.title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "og:image", content: `${location.origin}/${imageBase}-800.jpg` }
    ];

    // Twitter
    const twitterTags = [
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: article.title },
      { name: "twitter:description", content: desc },
      { name: "twitter:image", content: `${location.origin}/${imageBase}-800.jpg` }
    ];

    [...ogTags, ...twitterTags].forEach(tag => {
      const meta = document.createElement("meta");
      if (tag.property) meta.setAttribute("property", tag.property);
      if (tag.name) meta.setAttribute("name", tag.name);
      meta.setAttribute("content", tag.content);
      document.head.appendChild(meta);
    });

    // Monta as tags clicáveis
    const tagsHTML = article.tags
      .map(tag => `<a href="blog.html?tag=${encodeURIComponent(tag.toLowerCase())}" class="tag">#${tag}</a>`)
      .join(" ");

    // Monta as referências (se existirem)
    let referencesHTML = "";
    if (article.references && article.references.length > 0) {
      const refsList = article.references
        .map(ref => {
          if (ref.startsWith("http")) {
            return `<li><a href="${ref}" target="_blank" rel="noopener noreferrer">${ref}</a></li>`;
          } else {
            return `<li>${ref}</li>`;
          }
        })
        .join("");
      referencesHTML = `
        <section class="references">
          <h3>Referências</h3>
          <ul>${refsList}</ul>
        </section>
      `;
    }

    // Renderiza artigo
    container.innerHTML = `
      <header class="article-header">
        <h1 class="article-title">${article.title}</h1>
        <p class="article-meta">${article.date} · ${article.readTime}</p>
      </header>

      ${buildResponsiveImage(imageBase, article.title)}

      <div class="article-body">
        ${marked.parse(article.content)}
      </div>

      <footer class="article-footer">
        <div class="tags">
          ${tagsHTML}
        </div>
        ${referencesHTML}
        <a href="blog.html" class="btn btn-primary">← Voltar ao Blog</a>
      </footer>
    `;

    // Scroll suave ao topo
    window.scrollTo({ top: 0, behavior: "smooth" });
  })
  .catch(err => {
    console.error("Erro ao carregar artigo:", err);
    document.getElementById("article-content").innerHTML = `
      <p role="alert">Erro ao carregar o artigo. Tente novamente mais tarde.</p>
      <a href="blog.html" class="btn btn-primary">← Voltar ao Blog</a>
    `;
  });
