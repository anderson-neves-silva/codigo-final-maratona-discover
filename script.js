
const Modal = {
  //criação de um objeto.
  open() {
    //função abrir o modal, ela adicionar a class active ao modal.
    document.querySelector('.modal-overlay').classList.add('active');
  },
  close() {
    //função fechar o modal, ela remover a class active do modal.
    document.querySelector(".modal-overlay").classList.remove("active")
  }
}

const Storage = {
  //armazenando os dados no local storage do browser. get e pegar e ser e arrumar/guardar.
  //precisamos transformar um array para uma string pois sempre o localStorage guarda string.
  get() {
    //aqui vamos desfazer oque fizemos no set, ou seja, transformar a string em array como era antes.
    //quem faz isso acontecer é o "parse", e "||" = "OU", caso nao tenha a chave retornar um array vazio.
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },

  set(transactions) {
    //aqui usamos um objeto JSON que tem uma funcao "stringify" que transformar em string as transactions.
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
  }
}

const Transaction = {
  //obejto responsável por execultar as transações e cálculos.
  //aqui e onde configuramos para que os dados seje salvos no local storage do browser.
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    
    App.reload();
  },

  //metodo que remove.
  remove(index) {
    Transaction.all.splice(index, 1);
     App.reload();
  },

  incomes() {
    let income = 0;
    //pegar todas as trasações.
    //para cada trasação.
    Transaction.all.forEach(transaction => {
      //se ela for maior que zero.
      if (transaction.amount > 0) {
        //somar a uma variável e retornar a varirável
        income = income + transaction.amount;
      }
    })

    return income;
  },

  expenses() {
    let expense = 0;
    Transaction.all.forEach(transaction => {
      //se ela for menor que zero.
      if (transaction.amount < 0) {
        //somar a uma variável e retornar a varirável
        expense = expense + transaction.amount;
      }
    })

    return expense;
  },

  total() {
    //calcular entradas - saídas.
    return Transaction.incomes() + Transaction.expenses();
  }
}

const DOM = {
  //criando um container onde ira conter os dados onde quem irá criar agora é o js e não mais o html.
  transactionsContainer: document.querySelector('#data-table tbody'),

  //o cara responsável por adicionar trasação, obs. o index e a posicao do array la no objeto.
  addTransaction(transaction, index) {    
    //criando o elemento tr em formato de objeto.
    const tr = document.createElement('tr');
    //chamando o html para dentro da tr.
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    //adicionando o index.
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    //fazendo o expense=despesas trocar por incomes=rendimentos quando for valor positivo.
    //operadores ternários, ?=então :=senão.
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    //estamos usando tamplayte literals, usamos essa crase diferente.
    const html = 
    //fazendo a interpolação
    //na linha 118 colocamos a forma de remover um dado atraves da imagem isso pelo um indice. 
    `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
    `
    return html;
  },

  //atualizando os valores das trasações.
  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
  },

  //faz o tbody do index voltar a ser vazio.
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  }
}

const Utils = {
  formatAmount(value) {
    //eliminando as casas decimais.
    value = Number(value) * 100;
    
    return value;
  },

  formatDate(date) {
    //tratando os dados pois vem em ordem diferente e com tracos para separar.
    const splittedDate = date.split("-")
    //vamos usar o tamplaites literal para mostrar a ordem que queremos.
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  //currency=moeda.
  formatCurrency(value) {
    //verificando verdadeiro = ? e falso :, operadores ternários.
    const signal = Number(value) < 0 ? "-" : "";

    //fazendo a idéia do sifrão, no fim é uma expressão regular.
    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return (signal + value);
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  //pegando so os valores e guardando nessa funcao.
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  formatData() {
    console.log("formatar os dados");
  },

  validateFields() {
    const {description, amount, date} = Form.getValues();
    //checa se os campos estao vazios.
    if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues() {
    let {description, amount, date} = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    //retornar o valores formatados, obs. no description nao precisamos fazer nada.
    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    //interrompendo o comportamento padrao para fazermos as nossas funcionalidades.
    event.preventDefault();



    //usando o try para capituramos o erro.
    try {
      //vefica ou valida se todos os campos foram preenchidos.
      Form.validateFields();
      
      //formatar os dados para salvar.
      const transaction = Form.formatValues();

      //salvar, poderiamos criar uma funcao mas como e apenas uma linha nao precisa, e tambem deu erro .
      Transaction.add(transaction);

      //apagar os dados do formulario.
      Form.clearFields();

      //fechar o modal.
      Modal.close();

      //atualizar a aplicacao, Obs. ela ja esta em Transaction.      
    } catch (error) {
      alert(error.message);
    }
  }
}

const App = {
  init() {    
    //popula a aplicacao, ou seja, adicionando na DOM.
    Transaction.all.forEach(DOM.addTransaction);

    //atualizando a parte dos cartoes.
    DOM.updateBalance();
    
    //atualizando o localStorage, ou onde guardamos os dados.
    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  },
}

//inicia a aplicacao.
App.init();