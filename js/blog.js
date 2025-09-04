// Carregar artigos do JSON e renderizar lista no blog.html
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("articles-container");

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Nenhum artigo publicado ainda.</p>";
      return;
    }

    data.forEach(article => {
      // Fallbacks para evitar undefined
      const id = article.id ?? "";
      const title = article.title ?? "Artigo sem título";
      const excerpt = article.excerpt ?? "Resumo não disponível.";
      const category = article.category ?? "Sem categoria";
      const date = article.date ?? "";
      const readTime = article.readTime ?? "";
      const image = article.image && article.image.trim() !== "" 
        ? article.image 
        : "images/placeholder.jpg"; // imagem padrão

      const articleEl = document.createElement("article");
      articleEl.className = "post-card";

      articleEl.innerHTML = `
        <div class="post-image-container">
          <img src="${image}" alt="${title}" class="post-image" loading="lazy">
          <span class="post-category">${category}</span>
        </div>
        <div class="post-content">
          <h2 class="post-title">
            <a href="blog-post.html?id=${id}">${title}</a>
          </h2>
          <p class="post-excerpt">${excerpt}</p>
          <div class="post-meta">
            <span class="post-author">
              <img src="images/avatar-ismael.jpg" alt="Foto de Ismael Nunes" class="author-avatar">
              Ismael Nunes
            </span>
            <span>${date}</span>
            <span>${readTime}</span>
          </div>
          <a href="blog-post.html?id=${id}" class="read-more">
            Ler mais <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      `;

      container.appendChild(articleEl);
    });
  })
  .catch(err => {
    console.error("Erro ao carregar artigos:", err);
    document.getElementById("articles-container").innerHTML =
      "<p>Erro ao carregar artigos. Tente novamente mais tarde.</p>";
  });
