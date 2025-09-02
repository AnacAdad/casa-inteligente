const apiUrl = "http://localhost:3000/dispositivos";

function atualizarStatus() {
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      document.getElementById("status").textContent = JSON.stringify(data, null, 2);

      // Atualiza cores dos dispositivos
      for (const [nome, estado] of Object.entries(data)) {
        const card = document.getElementById(nome + "-card");
        if (!card) continue;

        if (estado === "ligado" || estado === "ligada" || estado === "acesa") {
          card.classList.add("ativo");
        } else {
          card.classList.remove("ativo");
        }
      }
    })
    .catch(err => console.error("Erro ao atualizar status:", err));
}

function alterarStatus(nome, status) {
  fetch(`${apiUrl}/${nome}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })
  .then(res => res.json())
  .then(() => atualizarStatus())
  .catch(err => console.error("Erro ao alterar status:", err));
}

// Carrega status inicial
atualizarStatus();

