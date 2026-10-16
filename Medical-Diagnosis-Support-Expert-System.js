const knowledgeBase = {
  "Common Cold": {symptoms:["runny nose","sneezing","sore throat","cough","mild headache"],advice:"Rest, drink plenty of fluids, and monitor your symptoms."},
  "Influenza (Flu)": {symptoms:["fever","cough","body aches","fatigue","headache","sore throat"],advice:"Rest, stay hydrated, and consider consulting a healthcare professional."},
  "Migraine": {symptoms:["severe headache","nausea","sensitivity to light","sensitivity to sound"],advice:"Rest in a quiet, dark room and seek medical advice if severe or recurring."},
  "Gastroenteritis": {symptoms:["nausea","vomiting","diarrhea","stomach pain","fever"],advice:"Drink fluids to prevent dehydration and consult a doctor if symptoms are severe."},
  "Allergic Rhinitis": {symptoms:["sneezing","runny nose","itchy eyes","nasal congestion"],advice:"Avoid known allergens and consult a healthcare professional if symptoms persist."},
  "Bronchitis": {symptoms:["cough","chest discomfort","fatigue","mild fever","shortness of breath"],advice:"Rest, drink fluids, and seek medical advice, especially if breathing becomes difficult."},
  "Possible Pneumonia": {symptoms:["fever","cough","shortness of breath","chest pain","fatigue"],advice:"Seek medical attention promptly, especially if breathing is difficult."}
};

function diagnose(selected){
  const user = new Set(selected), results = [];
  for (const [disease, info] of Object.entries(knowledgeBase)){
    const matched = info.symptoms.filter(s => user.has(s));
    if (matched.length){
      results.push({
        disease, matched, all: info.symptoms, advice: info.advice,
        score: Math.round(matched.length / info.symptoms.length * 10000) / 100
      });
    }
  }
  return results.sort((a,b) => b.score - a.score);
}

const symptomList = [...new Set(Object.values(knowledgeBase).flatMap(d => d.symptoms))].sort();
const chipsEl = document.getElementById("chips");
const countEl = document.getElementById("count");
const outEl = document.getElementById("out");
const selLine = document.getElementById("sel-line");

symptomList.forEach(s => {
  const l = document.createElement("label");
  l.className = "chip";
  l.innerHTML = '<input type="checkbox" value="' + s + '"><span>' + s + '</span>';
  chipsEl.appendChild(l);
});

const boxes = () => [...chipsEl.querySelectorAll("input")];
const selected = () => boxes().filter(b => b.checked).map(b => b.value);
const esc = t => t.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

chipsEl.addEventListener("change", () => { countEl.textContent = selected().length + " selected"; });

document.getElementById("clear").addEventListener("click", () => {
  boxes().forEach(b => b.checked = false);
  countEl.textContent = "0 selected";
  selLine.textContent = "Results appear here.";
  outEl.innerHTML = '<p class="empty">Choose symptoms, then run the diagnosis.</p>';
});

document.getElementById("run").addEventListener("click", () => {
  const sel = selected();
  if (!sel.length){
    selLine.textContent = "Results appear here.";
    outEl.innerHTML = '<p class="warn">Select at least one symptom to run the diagnosis.</p>';
    return;
  }
  selLine.textContent = "Based on: " + sel.join(", ") + ".";
  const top = diagnose(sel).slice(0, 3);
  outEl.innerHTML = top.map((r, i) => `
    <article class="res">
      <div class="res-head"><h3>${i + 1}. ${esc(r.disease)}</h3><span class="score">${r.score}%</span></div>
      <div class="bar" role="img" aria-label="Match score ${r.score} percent"><i style="width:0%" data-w="${r.score}"></i></div>
      <div class="tags">${r.all.map(s => `<span class="tag${r.matched.includes(s) ? " hit" : ""}">${esc(s)}</span>`).join("")}</div>
      <p class="advice">${esc(r.advice)}</p>
    </article>`).join("");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    outEl.querySelectorAll(".bar i").forEach(b => b.style.width = b.dataset.w + "%");
  }));
});
