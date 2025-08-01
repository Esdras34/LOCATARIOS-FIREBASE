  // Importando os SDKs necessários
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
  import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
  const database = getDatabase(app);

  // Função para validar CPF
  function validarCPF(cpf) {
      cpf = cpf.replace(/[\D]/g, "");
      if (cpf.length !== 11 || /^( 11|(\d)\1{10})$/.test(cpf)) return false;
      let soma = 0, resto;
      for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
      resto = (soma * 10) % 11;
      if ((resto === 10) || (resto === 11)) resto = 0;
      if (resto !== parseInt(cpf.substring(9, 10))) return false;
      soma = 0;
      for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
      resto = (soma * 10) % 11;
      if ((resto === 10) || (resto === 11)) resto = 0;
      if (resto !== parseInt(cpf.substring(10, 11))) return false;
      return true;
  }

  // Máscara de CPF
  document.addEventListener("DOMContentLoaded", () => {
      const cpfInput = document.getElementById("cpf");
      cpfInput.addEventListener("input", function() {
          let v = this.value.replace(/\D/g, "");
          if (v.length > 11) v = v.slice(0, 11);
          v = v.replace(/(\d{3})(\d)/, "$1.$2");
          v = v.replace(/(\d{3})(\d)/, "$1.$2");
          v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
          this.value = v;
      });
  });

  document.addEventListener("DOMContentLoaded", () => {
      const submitButton = document.getElementById("submitInfo");
      const loading = document.getElementById("loading");
      const rentalForm = document.getElementById("rentalForm");

      submitButton.addEventListener("click", async () => {
          const nome = document.getElementById("nome").value;
          const cpf = document.getElementById("cpf").value;
          const rg = document.getElementById("rg").value;
          const celular = document.getElementById("celular").value;
          const valor = document.getElementById("valor").value;
          const idade = document.getElementById("idade").value;
          const quantidadePessoas = document.getElementById("quantidadePessoas").value;
          const formaPagamento = document.getElementById("formaPagamento").value;

          // Validação dos campos
          if (!nome || !cpf || !rg || !celular || !valor || !idade || !quantidadePessoas || !formaPagamento) {
              alert("Preencha todos os campos!");
              return;
          }

          // Validação do CPF
          if (!validarCPF(cpf)) {
              alert("CPF inválido! Por favor, digite um CPF válido no formato 000.000.000-00.");
              document.getElementById("cpf").focus();
              return;
          }

          // Validação da idade e quantidade de pessoas
          if (idade <= 0 || quantidadePessoas <= 0) {
              alert("A idade e a quantidade de pessoas devem ser maiores que 0.");
              return;
          }

          try {
              // Mostra o ícone de carregamento
              loading.style.display = "block";
              submitButton.disabled = true;

              // Adicione os dados ao Realtime Database
              const newLocatarioRef = push(ref(database, "locatarios"), {
                  nome,
                  cpf,
                  rg,
                  celular,
                  valor,
                  idade,
                  quantidadePessoas,
                  formaPagamento,
                  timestamp: new Date().toISOString()
              });

              console.log("Dados salvos com ID:", newLocatarioRef.key);

              // Exibe mensagem de sucesso visual
              const successMessage = document.getElementById("successMessage");
              successMessage.style.display = "block";
              // Limpa o formulário
              rentalForm.reset();
              document.getElementById("cpf").value = "";
              document.getElementById("nome").value = "";
              document.getElementById("rg").value = "";
              document.getElementById("celular").value = "";
              document.getElementById("valor").value = "";
              document.getElementById("idade").value = "";
              document.getElementById("quantidadePessoas").value = "";
              document.getElementById("formaPagamento").value = "";
              document.getElementById("confirmTerms").checked = false;
              document.getElementById("confirmData").checked = false;
              document.getElementById("submitInfo").disabled = true;
              // Oculta o card do Pix, se estiver visível
              const pixCard = document.getElementById("pixCard");
              pixCard.style.display = "none";
              // Oculta a mensagem após 3 segundos
              setTimeout(() => {
                  successMessage.style.display = "none";
              }, 3000);

          } catch (error) {
              console.error("Erro ao salvar:", error);
              alert("Erro ao enviar os dados.");
          } finally {
              loading.style.display = "none";
              submitButton.disabled = false;
          }
      });
  });

  // Lógica Pix e checkboxes agora dentro do módulo
  const formaPagamento = document.getElementById('formaPagamento');
  const pixCard = document.getElementById('pixCard');
  formaPagamento.addEventListener('change', () => {
      pixCard.style.display = formaPagamento.value === "Pix" ? "block" : "none";
  });

  document.querySelectorAll('.form-check-input').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
          document.getElementById('submitInfo').disabled = !document.getElementById('confirmTerms').checked || !document.getElementById('confirmData').checked;
      });
  });

  window.copyPixKey = function() {
      navigator.clipboard.writeText("").then(() => alert("Chave Pix removida!"));
  }