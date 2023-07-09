let client = {
  table: '',
  hour: '',
  order: []
}

const categories = {
  1: "Meals",
  2: "Drinks",
  3: "Desserts"
}

const btnSaveClient = document.querySelector("#guardar-cliente");
btnSaveClient.addEventListener('click', saveClient);

function saveClient(e) {
  const table = document.querySelector("#table").value;
  const hour = document.querySelector("#hour").value;

  // Check if some field is empty
  const emptyFields = [table, hour].some(field => field === '');

  if (emptyFields) {
    // if exist an alert
    const existAlert = document.querySelector(".invalid-feedback");
    if (!existAlert) {
      const alert = document.createElement("DIV");
      alert.classList.add("invalid-feedback", "d-block", "text-center");
      alert.textContent = "All field are required!";
      document.querySelector(".modal-body form").appendChild(alert);
      setTimeout(() => alert.remove(), 3000);
    }

    return;
  }

  client = { ...client, table, hour };

  const formModal = document.querySelector("#formulario");
  const bootstrapModal = bootstrap.Modal.getInstance(formModal);
  bootstrapModal.hide();

  showSections();
  getMenu();
}

function showSections() {
  const hiddenSections = document.querySelectorAll(".d-none");
  if (hiddenSections) {
    hiddenSections.forEach(section => section.classList.remove("d-none"))
  }
}

function getMenu() {
  const URL = "http://localhost:4000/platillos";

  fetch(URL)
    .then(response => response.json())
    .then(menuItems => printMenuItems(menuItems))
    .catch(error => console.log(error.message));
}

function printMenuItems(menuItems) {
  if (menuItems) {
    const menuContainer = document.querySelector(".contenido");
    menuItems.forEach(item => {
      const { id, nombre, precio, categoria } = item;
      const row = document.createElement("DIV");
      row.classList.add("row", "py-3", "border-top");

      const nameElement = document.createElement("DIV");
      nameElement.classList.add("col-md-4");
      nameElement.textContent = nombre;

      const priceElement = document.createElement("DIV");
      priceElement.classList.add("col-md-3", "fw-bold");
      priceElement.textContent = `$${precio}`;

      const categoryElement = document.createElement("DIV");
      categoryElement.classList.add("col-md-3");
      categoryElement.textContent = categories[categoria];

      const inputElement = document.createElement("INPUT");
      inputElement.type = "number";
      inputElement.min = 0;
      inputElement.id = `product-${id}`;
      inputElement.value = 0;
      inputElement.classList.add("form-control");

      inputElement.onchange = () => {
        const quantity = parseInt(inputElement.value);
        addSaucer({ ...item, quantity });
      };

      const addElement = document.createElement("DIV");
      addElement.classList.add("col-md-2");
      addElement.appendChild(inputElement);

      row.appendChild(nameElement);
      row.appendChild(priceElement);
      row.appendChild(categoryElement);
      row.appendChild(addElement);

      menuContainer.appendChild(row);
    });
  }
}

function addSaucer(saucer) {
  // Create a copy of order
  let { order } = client;

  // check if saucer.quantity is >= 0
  if (saucer.quantity > 0) {
    // Check if that order isn't repeated
    if (order.some(item => item.id === saucer.id)) {
      // update quantity
      const updatedOrder = order.map(item => {
        if (item.id === saucer.id) {
          item.quantity = saucer.quantity;
        }
        return item;
      });
      client.order = [...updatedOrder];

    } else {
      // Add the saucer
      client.order = [...order, saucer];
    }

  } else {
    // detele elements when quantity is 0
    const result = order.filter(item => item.id !== saucer.id);
    client.order = [...result];
  }

  // clear html
  clearHtml();

  if (client.order.length) {
    updateSummary();
  } else {
    msgEmptyOrder();
  }

}

function updateSummary() {
  const container = document.querySelector("#resumen .contenido");

  const summary = document.createElement("DIV");
  summary.classList.add("col-md-6", "card", "py-2", "px-3", "shadow", "rounded");

  const table = document.createElement("P");
  table.textContent = "Table: "
  table.classList.add("fw-bold");

  const tableSpan = document.createElement("SPAN");
  tableSpan.classList.add("fw-normal");
  tableSpan.textContent = client.table;

  const hour = document.createElement("P");
  hour.textContent = "Hour: "
  hour.classList.add("fw-bold");

  const hourSpan = document.createElement("SPAN");
  hourSpan.classList.add("fw-normal");
  hourSpan.textContent = client.hour;

  const heading = document.createElement("H3");
  heading.classList.add("my-4", "text-center");
  heading.textContent = 'Order';

  table.appendChild(tableSpan);
  hour.appendChild(hourSpan);

  const group = document.createElement("UL");
  group.classList.add("list-group");

  const { order } = client;
  order.forEach(item => {

    const { id, nombre, quantity, precio } = item;

    const list = document.createElement("LI");
    list.classList.add("list-group-item");

    const nameEl = document.createElement("H4");
    nameEl.classList.add("my-4");
    nameEl.textContent = nombre;

    const quantityEl = document.createElement("P");
    quantityEl.classList.add("fw-bold");
    quantityEl.textContent = "Quantity: ";

    const quantityValue = document.createElement("SPAN");
    quantityValue.classList.add("fw-normal");
    quantityValue.textContent = quantity;

    const priceEl = document.createElement("P");
    priceEl.classList.add("fw-bold");
    priceEl.textContent = "Price: ";

    const priceValue = document.createElement("SPAN");
    priceValue.classList.add("fw-normal");
    priceValue.textContent = `$${precio}`;

    const subtotalEl = document.createElement("P");
    subtotalEl.classList.add("fw-bold");
    subtotalEl.textContent = "Subtotal: ";

    const subtotalValue = document.createElement("SPAN");
    subtotalValue.classList.add("fw-normal");
    subtotalValue.textContent = `$${calcSubtotal(precio, quantity)}`;

    const deleteBtn = document.createElement("BUTTON");
    deleteBtn.classList.add("btn", "btn-danger");
    deleteBtn.textContent = "Delete item";

    deleteBtn.onclick = () => {
      deleteItem(id);
    }

    quantityEl.appendChild(quantityValue);
    priceEl.appendChild(priceValue);
    subtotalEl.appendChild(subtotalValue);

    list.appendChild(nameEl);
    list.appendChild(quantityEl);
    list.appendChild(priceEl);
    list.appendChild(subtotalEl);
    list.appendChild(deleteBtn);

    group.appendChild(list);
  });

  summary.appendChild(heading);
  summary.appendChild(table);
  summary.appendChild(hour);
  summary.appendChild(group);

  container.appendChild(summary);

  // baksheesh form
  showBaksheesh();
}

function clearHtml() {
  const container = document.querySelector("#resumen .contenido");
  if (container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
}

function deleteItem(id) {
  const { order } = client;
  const result = order.filter(item => item.id !== id);
  client.order = [...result];

  // clear html
  clearHtml();

  if (client.order.length) {
    updateSummary();
  } else {
    msgEmptyOrder();
  }

  // Deleted product
  const deletedProduct = `#product-${id}`;
  const inputProduct = document.querySelector(deletedProduct);
  inputProduct.value = 0;
}

function msgEmptyOrder() {
  const container = document.querySelector("#resumen .contenido");

  const msg = document.createElement("P");
  msg.classList.add("text-center");
  msg.textContent = "Añade los elementos del pedido";

  container.appendChild(msg);
}

function showBaksheesh() {
  const container = document.querySelector("#resumen .contenido");

  const form = document.createElement("DIV");
  form.classList.add("col-md-6", "formulario");

  const divForm = document.createElement("DIV");
  divForm.classList.add("shadow", "rounded", "card", "py-2", "px-3", "text-center");

  const heading = document.createElement("H3");
  heading.classList.add("my-4");
  heading.textContent = "Baksheesh";

  const radio10 = document.createElement("INPUT");
  radio10.type = "radio";
  radio10.value = "10";
  radio10.name = "baksheesh";
  radio10.classList.add("form-check-input");
  radio10.onclick = calcBaksheesh;

  const radio10Label = document.createElement("LABEL");
  radio10Label.textContent = "10%";
  radio10Label.classList.add("form-check-label");

  const radio10Div = document.createElement("DIV");
  radio10Div.classList.add("form-check");

  radio10Div.appendChild(radio10);
  radio10Div.appendChild(radio10Label);

  const radio25 = document.createElement("INPUT");
  radio25.type = "radio";
  radio25.value = "25";
  radio25.name = "baksheesh";
  radio25.classList.add("form-check-input");
  radio25.onclick = calcBaksheesh;

  const radio25Label = document.createElement("LABEL");
  radio25Label.textContent = "25%";
  radio25Label.classList.add("form-check-label");

  const radio25Div = document.createElement("DIV");
  radio25Div.classList.add("form-check");

  radio25Div.appendChild(radio25);
  radio25Div.appendChild(radio25Label);

  const radio50 = document.createElement("INPUT");
  radio50.type = "radio";
  radio50.value = "50";
  radio50.name = "baksheesh";
  radio50.classList.add("form-check-input");
  radio50.onclick = calcBaksheesh;

  const radio50Label = document.createElement("LABEL");
  radio50Label.textContent = "50%";
  radio50Label.classList.add("form-check-label");

  const radio50Div = document.createElement("DIV");
  radio50Div.classList.add("form-check");

  radio50Div.appendChild(radio50);
  radio50Div.appendChild(radio50Label);

  divForm.appendChild(heading);
  divForm.appendChild(radio10Div);
  divForm.appendChild(radio25Div);
  divForm.appendChild(radio50Div);

  form.appendChild(divForm);

  container.appendChild(form);
}

function calcBaksheesh() {
  const { order } = client;
  let subtotal = 0;

  order.forEach(item => {
    subtotal += item.precio * item.quantity;
  });

  const baksheeshSelected = parseInt(document.querySelector("[name='baksheesh']:checked").value);

  const baksheesh = ((subtotal * baksheeshSelected) / 100);

  const total = subtotal + baksheesh;

  showTotal(subtotal, total, baksheesh);
}

function showTotal(subtotal, total, baksheesh) {

  const totalContainer = document.createElement("DIV");
  totalContainer.classList.add("total-pagar", "my-3");

  const subtotalP = document.createElement("P");
  subtotalP.classList.add("fs-4", "fw-bold", "mt-2");
  subtotalP.textContent = "Subtotal: ";

  const subtotalSpan = document.createElement("SPAN");
  subtotalSpan.classList.add("fw-normal");
  subtotalSpan.textContent = `$${subtotal}`;

  subtotalP.appendChild(subtotalSpan);

  const totalP = document.createElement("P");
  totalP.classList.add("fs-4", "fw-bold", "mt-2");
  totalP.textContent = "total: ";

  const totalSpan = document.createElement("SPAN");
  totalSpan.classList.add("fw-normal");
  totalSpan.textContent = `$${total}`;

  totalP.appendChild(totalSpan);

  const baksheeshP = document.createElement("P");
  baksheeshP.classList.add("fs-4", "fw-bold", "mt-2");
  baksheeshP.textContent = "baksheesh: ";

  const baksheeshSpan = document.createElement("SPAN");
  baksheeshSpan.classList.add("fw-normal");
  baksheeshSpan.textContent = `$${baksheesh}`;

  baksheeshP.appendChild(baksheeshSpan);

  // clear html

  const divTotalPay = document.querySelector(".total-pagar");
  if (divTotalPay) {
    divTotalPay.remove();
  }


  totalContainer.appendChild(subtotalP);
  totalContainer.appendChild(baksheeshP);
  totalContainer.appendChild(totalP);

  const form = document.querySelector(".formulario > div");
  form.appendChild(totalContainer);

}

const calcSubtotal = (a, b) => a * b;