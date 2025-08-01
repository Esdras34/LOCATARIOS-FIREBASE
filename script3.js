 // Importando os SDKs necessários
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
 import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

 // Configuração do Firebase
 const firebaseConfig = {
   apiKey: "AIzaSyCEBsnKcy8sEvz-7Dv2xcFpoehgsYGj51g",
   authDomain: "cadastrolocatario-76a8a.firebaseapp.com",
   databaseURL: "https://cadastrolocatario-76a8a-default-rtdb.firebaseio.com",
   projectId: "cadastrolocatario-76a8a",
   storageBucket: "cadastrolocatario-76a8a.appspot.com",
   messagingSenderId: "962665329095",
   appId: "1:962665329095:web:74f536c3dfb61a326669e2",
   measurementId: "G-VK8GLN5EKE"
 };

 // Inicializando o Firebase
 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);
 const db = getDatabase(app);

 const pendentesList = document.getElementById("pendentesList");
 const aprovadosList = document.getElementById("aprovadosList");
 const finalizadosList = document.getElementById("finalizadosList");

 const timers = {};

 function createCronometroElement(id) {
     const cronDiv = document.createElement("div");
     cronDiv.className = "cronometro";
     cronDiv.id = `cron-${id}`;

     // Recupera o tempo salvo no localStorage, se existir
     let seconds = parseInt(localStorage.getItem(`cronometro_${id}`)) || 0;
     cronDiv.textContent = formatTime(seconds);

     let interval = null;

     function formatTime(s) {
         const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
         const min = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
         const sec = String(s % 60).padStart(2, '0');
         return `${hrs}:${min}:${sec}`;
     }

     const startBtn = document.createElement("button");
     startBtn.className = "btn btn-success btn-sm btn-cron";
     startBtn.textContent = "Iniciar";
     startBtn.onclick = () => {
         if (!interval) {
             interval = setInterval(() => {
                 seconds++;
                 cronDiv.textContent = formatTime(seconds);
                 // Salva o tempo no localStorage
                 localStorage.setItem(`cronometro_${id}`, seconds);
             }, 1000);
             timers[id] = interval;
         }
     };

     const stopBtn = document.createElement("button");
     stopBtn.className = "btn btn-danger btn-sm btn-cron";
     stopBtn.textContent = "Parar";
     stopBtn.onclick = () => {
         clearInterval(timers[id]);
         interval = null;
         // Salva o tempo atual ao parar
         localStorage.setItem(`cronometro_${id}`, seconds);
     };

     return { cronDiv, startBtn, stopBtn };
 }

 function createCard(data, id, status) {
     const div = document.createElement("div");
     div.className = `card p-3 ${status}`;
     // Montar o card manualmente para evitar duplicidade
     const nomeEl = document.createElement('h5');
     nomeEl.textContent = data.nome;
     div.appendChild(nomeEl);
     const cpfEl = document.createElement('p');
     cpfEl.innerHTML = `<strong>CPF:</strong> ${data.cpf}`;
     div.appendChild(cpfEl);
     const celEl = document.createElement('p');
     celEl.innerHTML = `<strong>Celular:</strong> ${data.celular}`;
     div.appendChild(celEl);
     const valorEl = document.createElement('p');
     valorEl.innerHTML = `<strong>Valor:</strong> R$ ${data.valor}`;
     div.appendChild(valorEl);
     const pagEl = document.createElement('p');
     pagEl.innerHTML = `<strong>Forma de Pagamento:</strong> ${data.formaPagamento}`;
     div.appendChild(pagEl);
     let obsEl = null;
     if (data.observacao && data.observacao.trim()) {
         obsEl = document.createElement('p');
         obsEl.className = 'observacao-label';
         obsEl.innerHTML = `<strong>Observação:</strong> ${data.observacao}`;
         div.appendChild(obsEl);
     }
     // APROVADO: status, cronômetro, botões
     if (status === "aprovado") {
         // Status
         const statusLabel = document.createElement('p');
         statusLabel.className = `status-label text-success`;
         statusLabel.textContent = `Status: ${status}`;
         div.appendChild(statusLabel);
         // Cronômetro
         const { cronDiv, startBtn, stopBtn } = createCronometroElement(id);
         div.appendChild(cronDiv);
         // Botões em coluna
         const btnsDiv = document.createElement('div');
         btnsDiv.style.display = 'flex';
         btnsDiv.style.flexDirection = 'column';
         btnsDiv.style.gap = '4px';
         btnsDiv.style.margin = '10px 0';
         btnsDiv.appendChild(startBtn);
         btnsDiv.appendChild(stopBtn);
         // Botão finalizar
         const finalizarBtn = document.createElement("button");
         finalizarBtn.className = "btn btn-secondary btn-sm btn-finalizar";
         finalizarBtn.textContent = "Finalizar";
         finalizarBtn.style.marginTop = '4px';
         finalizarBtn.onclick = () => {
             if (confirm(`Deseja finalizar o locatário ${data.nome}?`)) {
                 clearInterval(timers[id]);
                 update(ref(db, `locatarios/${id}`), { status: "finalizado" });
             }
         };
         btnsDiv.appendChild(finalizarBtn);
         div.appendChild(btnsDiv);
         // Botão imprimir
         const printBtn = document.createElement("button");
         printBtn.className = "btn btn-info btn-sm btn-imprimir";
         printBtn.textContent = "Imprimir Dados";
         printBtn.onclick = () => {
             const conteudo = `
                 <div style='font-family: Arial, sans-serif; max-width: 400px;'>
                     <h2>Dados do Locatário</h2>
                     <p><strong>Nome:</strong> ${data.nome}</p>
                     <p><strong>CPF:</strong> ${data.cpf}</p>
                     <p><strong>Celular:</strong> ${data.celular}</p>
                     <p><strong>Valor:</strong> R$ ${data.valor}</p>
                     <p><strong>Forma de Pagamento:</strong> ${data.formaPagamento}</p>
                     <p><strong>Observação:</strong> ${data.observacao || "Nenhuma observação"}</p>
                 </div>
             `;
             const win = window.open('', '', 'width=600,height=600');
             win.document.write(`<!DOCTYPE html><html><head><title>Impressão</title></head><body>${conteudo}</body></html>`);
             win.document.close();
             win.focus();
             win.print();
             win.close();
         };
         div.appendChild(printBtn);
         return div;
     }

     // Campo de observação e botão salvar para pendentes
     if (status === "pendente") {
         const observacaoInput = document.createElement("textarea");
         observacaoInput.className = "observacao-input";
         observacaoInput.placeholder = "Adicione uma observação";
         observacaoInput.value = data.observacao || "";

         const salvarBtn = document.createElement("button");
         salvarBtn.className = "btn btn-primary btn-sm mt-2";
         salvarBtn.textContent = "Salvar Observação";
         salvarBtn.onclick = () => {
             const observacao = observacaoInput.value;
             update(ref(db, `locatarios/${id}`), { observacao: observacao });
             alert("Observação salva!");
         };

         div.appendChild(observacaoInput);
         div.appendChild(salvarBtn);
     }

     // Botão para aprovar
     if (status === "pendente") {
         const btn = document.createElement("button");
         btn.className = "btn btn-success btn-sm btn-aprovar";
         btn.textContent = "Aprovar";
         btn.onclick = () => {
             if (confirm(`Deseja aprovar o locatário ${data.nome}?`)) {
                 update(ref(db, `locatarios/${id}`), { status: "aprovado" });
             }
         };
         div.appendChild(btn);
     }

     return div;
 }

 // Função de filtro de cards
 function filtrarCards(cards, termo) {
     if (!termo) return cards;
     termo = termo.toLowerCase();
     return cards.filter(card => {
         const nome = (card.data.nome || '').toLowerCase();
         const cpf = (card.data.cpf || '').toLowerCase();
         return nome.includes(termo) || cpf.includes(termo);
     });
 }

 // Guardar todos os dados para pesquisa
 let todosLocatarios = [];

 onValue(ref(db, "locatarios"), (snapshot) => {
     pendentesList.innerHTML = "";
     aprovadosList.innerHTML = "";
     finalizadosList.innerHTML = "";
     todosLocatarios = [];
     snapshot.forEach((child) => {
         const data = child.val();
         const id = child.key;
         const status = data.status || "pendente";
         todosLocatarios.push({ data, id, status });
     });
     renderizarCards();
 });

 // Função para renderizar os cards filtrados
 function renderizarCards() {
     pendentesList.innerHTML = "";
     aprovadosList.innerHTML = "";
     finalizadosList.innerHTML = "";
     const termo = document.getElementById('searchInput').value.trim().toLowerCase();
     const filtrados = filtrarCards(todosLocatarios, termo);
     filtrados.forEach(({ data, id, status }) => {
         const card = createCard(data, id, status);
         if (status === "pendente") {
             pendentesList.appendChild(card);
         } else if (status === "aprovado") {
             aprovadosList.appendChild(card);
         } else if (status === "finalizado") {
             finalizadosList.appendChild(card);
         }
     });
 }

 // Evento de pesquisa
 document.getElementById('searchInput').addEventListener('input', renderizarCards);