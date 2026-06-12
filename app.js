const supabase = supabase.createClient(
  "https://usmwmvfavamdwqzcmiat.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzbXdtdmZhdmFtZHdxemNtaWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNTI1ODQsImV4cCI6MjA5NjgyODU4NH0.PGZHLKFIIfsvh7O4nVoiVfphzhAazuFbW7wee7RWKAg"
);


let user = null;
let game = null;

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return alert(error.message);

  user = data.user;

  document.getElementById("auth").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  loadBalance();
}

async function loadBalance() {
  const { data } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  document.getElementById("balance").innerText = data.balance;
}

function startGame() {
  const bet = parseInt(document.getElementById("bet").value);

  game = {
    bet,
    mines: generateMines(3),
    opened: [],
    multiplier: 1
  };

  renderGrid();
}

function generateMines(count) {
  let arr = [];

  while (arr.length < count) {
    let r = Math.floor(Math.random() * 16);
    if (!arr.includes(r)) arr.push(r);
  }

  return arr;
 }

function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  for (let i = 0; i < 16; i++) {
    const btn = document.createElement("button");

    btn.className = "h-16 bg-slate-800 rounded";

    btn.onclick = () => clickTile(i, btn);

    grid.appendChild(btn);
  }
}

function clickTile(index, btn) {

  if (game.mines.includes(index)) {
    btn.classList.add("bg-red-500");
    alert("💣 You hit a mine!");
    game = null;
    return;
  }

  btn.classList.add("bg-green-500");

  game.opened.push(index);
  game.multiplier += 0.5;
}

async function cashOut() {
  if (!game) return;

  let win = game.bet * game.multiplier;

  const { data } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  let newBalance = data.balance + win;

  await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", user.id);

  alert("You won ₦" + win);

  loadBalance();
  game = null;
}