const menuGrid = document.querySelector("#menu-grid");
const contactDialog = document.querySelector("#contact-dialog");
const contactTrigger = document.querySelector("#contact-trigger");
const dialogClose = document.querySelector("#dialog-close");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"' && quoted && text[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (quoted) throw new Error("El archivo del menú contiene comillas sin cerrar.");
  if (value.length || row.length) {
    row.push(value.trim());
    if (row.some(Boolean)) rows.push(row);
  }

  if (rows.length < 2) throw new Error("El archivo del menú no contiene productos.");
  const [headers, ...records] = rows;
  const requiredHeaders = ["nombre", "precio", "descripcion", "ingredientes", "imagen"];
  const columns = Object.fromEntries(headers.map((header, index) => [header, index]));

  for (const header of requiredHeaders) {
    if (!(header in columns)) throw new Error(`Falta la columna "${header}" en el menú.`);
  }

  return records.map((record) =>
    Object.fromEntries(requiredHeaders.map((header) => [header, record[columns[header]] || ""])),
  );
}

function createMenuCard(item) {
  const article = document.createElement("article");
  article.className = "menu-card";

  const image = document.createElement("img");
  image.src = item.imagen;
  image.alt = item.nombre;
  image.loading = "lazy";

  const content = document.createElement("div");
  content.className = "menu-card-content";

  const title = document.createElement("div");
  title.className = "menu-card-title";

  const name = document.createElement("h3");
  name.textContent = item.nombre;

  const price = document.createElement("span");
  price.className = "menu-price";
  price.textContent = `$${item.precio}`;

  const description = document.createElement("p");
  description.className = "menu-description";
  description.textContent = item.descripcion;

  const ingredients = document.createElement("p");
  ingredients.className = "menu-ingredients";
  const label = document.createElement("strong");
  if (item.ingredientes) {
    label.textContent = "Ingredientes: ";
  }
  ingredients.append(label, document.createTextNode(item.ingredientes));

  title.append(name, price);
  content.append(title, description, ingredients);
  article.append(image, content);
  return article;
}

async function loadMenu() {
  try {
    const response = await fetch("menu.csv");
    if (!response.ok) throw new Error(`No se pudo cargar el menú (HTTP ${response.status}).`);
    const items = parseCsv(await response.text());
    menuGrid.replaceChildren(...items.map(createMenuCard));
  } catch (error) {
    console.error("Error al cargar el menú:", error);
    const message = document.createElement("p");
    message.className = "menu-status";
    message.textContent = "No pudimos cargar el menú. Por favor, intentá de nuevo más tarde.";
    menuGrid.replaceChildren(message);
  }
}

contactTrigger.addEventListener("click", () => contactDialog.showModal());
dialogClose.addEventListener("click", () => contactDialog.close());
contactDialog.addEventListener("click", (event) => {
  if (event.target === contactDialog) contactDialog.close();
});

loadMenu();
