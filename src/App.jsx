import React, { useEffect, useMemo, useState } from "react";
import "./styles/app.css";

import heroImg from "./assets/halwa-hero.jpg";
import panImg from "./assets/halwa-pan.jpg";
import carrotsImg from "./assets/carrots.jpg";

/**
 * Nutrition model:
 * You told: 500g carrots + 500g milk + dry fruits.
 * Exact nutrition varies by milk type + nuts quantity.
 * Below is a practical default that you can edit in one place.
 *
 * IMPORTANT:
 * I’m presenting values as "approximate" (best practice).
 */
const recipeInputs = {
  carrots_g: 500,
  milk_g: 500, // ~500 ml if milk is measured by volume
  milk_type: "full-fat", // change to "toned" if needed
  dry_fruits: [
    { name: "Almonds", grams: 15 },
    { name: "Cashews", grams: 15 },
    { name: "Raisins", grams: 15 },
  ],
};

// Approximate nutrition references (per 100g) — simplified but realistic
// Carrot raw per 100g: kcal 41, carbs 9.6, fiber 2.8, protein 0.9, fat 0.2
// Whole milk per 100g: kcal 61, carbs 4.8, protein 3.2, fat 3.3
// (Toned milk is lower fat/kcal — we’ll approximate if you switch.)
const REF = {
  carrot: { kcal: 41, carbs: 9.6, sugar: 4.7, fiber: 2.8, protein: 0.9, fat: 0.2 },
  milk_full: { kcal: 61, carbs: 4.8, sugar: 5.0, fiber: 0, protein: 3.2, fat: 3.3, satfat: 2.1 },
  milk_toned: { kcal: 47, carbs: 4.9, sugar: 5.0, fiber: 0, protein: 3.1, fat: 1.5, satfat: 1.0 },

  // rough nut profiles per 100g (not perfect, but good estimates for UI)
  almonds: { kcal: 579, carbs: 21.6, sugar: 4.4, fiber: 12.5, protein: 21.2, fat: 49.9, satfat: 3.8 },
  cashews: { kcal: 553, carbs: 30.2, sugar: 5.9, fiber: 3.3, protein: 18.2, fat: 43.9, satfat: 7.8 },
  raisins: { kcal: 299, carbs: 79.2, sugar: 59.2, fiber: 3.7, protein: 3.1, fat: 0.5, satfat: 0.2 },
};

// Vitamins/minerals: showing main ones people expect (carrot is huge in Vit A)
// Values are approximate and will vary.
const microsPer100gTypical = {
  vitaminA_rae_mcg: 700, // carrot-heavy dessert, approximate
  vitaminC_mg: 4,
  vitaminD_mcg: 0.7,     // milk contributes small; varies widely by fortification
  vitaminK_mcg: 10,
  vitaminB6_mg: 0.12,
  calcium_mg: 110,
  iron_mg: 0.9,
  potassium_mg: 240,
};

const storySections = [
  {
    roman: "I",
    title: "From the Womb of Bhoomi Devi",
    body: [
      "Long before modern culinary labels existed, the heartlands of Punjab and Haryana celebrated Gajrela rustic, farm-born creation from deep-red carrots of the subcontinent, like “congealed sunlight” stored within the earth.",
      "Mitti se Man tak (Soil to Soul): We honor Bhoomi Devi. The carrot, a root vegetable, is her gift—grounding and nourishing.",
      "The Chulha Ritual: Traditionally cooked over an open chulha, its gentle smoke carried a mitti (earth) aroma food tied to the elements.",
    ],
  },
  {
    roman: "II",
    title: "Pancha Tattva: The Five Elements",
    body: [
      "Indian cooking is balance—raw ingredients transformed into offering:",
    ],
  },
  {
    roman: "III",
    title: "Trinity of Culinary Wisdom",
    body: [
      "The Sacred Cow (Milk & Ghee): Milk reduces into richness; like a journey—ego evaporates, essence remains.",
      "Ayurvedic Balance: Winter brings Vata imbalance. Ghee warms, carrot grounds, cardamom uplifts—seasonal comfort with intention.",
      "Annapurna Spirit: Grating carrots and stirring slowly is tapas—devotion you can taste.",
    ],
  },
  {
    roman: "IV",
    title: "The Kadhai(Wok) as a Family Mandir",
    body: [
      "The heavy kadhai(Wok) is an altar. Stirring is dhyana—attention so nothing burns.",
      "Halwa is rarely cooked alone: elders share stories, children help, traditions pass hand-to-hand.",
    ],
  },
  {
    roman: "V",
    title: "Naivedya & Hospitality",
    body: [
      "The final red glow—Shakti, warmth, auspiciousness.",
      "A spoonful offered first as naivedya. Then served: Atithi Devo Bhava—guests treated as divine.",
    ],
  },
];

const panchaTattva = [
  { key: "Prithvi", subtitle: "Earth", text: "Carrot—grounding, steady, nourishing the body." },
  { key: "Jala", subtitle: "Water", text: "Milk + vegetable juices—purity, flow, sweetness." },
  { key: "Agni", subtitle: "Fire", text: "Slow heat transforms—softens, caramelizes." },
  { key: "Vayu", subtitle: "Air", text: "Cardamom + ghee aroma—fragrance that lifts." },
  { key: "Akasha", subtitle: "Space", text: "Time + patience—space for family to gather." },
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("on");
        }
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="section">
      <div className="container">
        <div className="sectionHead reveal">
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          <h2 className="h2">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Nav() {
  const items = [
    { href: "#recipe", label: "Recipe" },
    { href: "#explanation", label: "Explanation" },
    { href: "#story", label: "Origin" },
    { href: "#nutrition", label: "Nutrition" },
  ];
  return (
    <header className="navWrap">
      <div className="nav container">
        <a className="brand" href="#top" aria-label="Go to top">
          <span className="brandMark" aria-hidden="true">ग</span>
          <span className="brandText">Gajar Ka Halwa</span>
        </a>
        <nav className="navLinks" aria-label="Primary">
          {items.map((it) => (
            <a key={it.href} href={it.href} className="navLink">{it.label}</a>
          ))}
          <a className="navCta" href="#recipe">Cook it</a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div className="hero" id="top">
      <div className="container heroGrid">
        <div className="heroCopy reveal">
          <h1 className="h1">Gajar Ka Halwa By Gaurav</h1>
          <p className="lede">
            Slow-cooked carrots and milk, finished with ghee, cardamom and nuts an Indian winter classic made with patience.
          </p>

          <div className="heroActions">
            <a className="button primary" href="#recipe">View recipe</a>
            <a className="button ghost" href="#story">Read the origin</a>
          </div>

          <div className="heroMeta" role="list" aria-label="Recipe meta">
            <div className="metaCard" role="listitem">
              <div className="metaTop">Time</div>
              <div className="metaMain">60–90 min</div>
              <div className="metaSub">low & slow</div>
            </div>
            <div className="metaCard" role="listitem">
              <div className="metaTop">Batch</div>
              <div className="metaMain">500g</div>
              <div className="metaSub">carrots + milk</div>
            </div>
            <div className="metaCard" role="listitem">
              <div className="metaTop">Finish</div>
              <div className="metaMain">Ghee</div>
              <div className="metaSub">cardamom, nuts</div>
            </div>
          </div>
        </div>

        <div className="heroArt reveal" aria-hidden="true">
          <div className="photoCard">
            <img src={heroImg} alt="" />
            <div className="photoOverlay" />
            <div className="photoCaption">
              <div className="photoCaptionTitle">Auspicious Warmth • Festive Glow</div>
              <div className="photoCaptionChips">
                <span className="chip">Saffron warmth</span>
                <span className="chip">Kadhai(Wok)-cooked</span>
                <span className="chip">Cardamom</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Recipe() {
  const ingredients = [
    "500 g red carrots (gajar), washed and grated",
    "500 g milk (≈500 ml) full-fat preferred for richness",
    "2–3 tbsp ghee (adjust to taste)",
    "Sugar to taste (start small; add after reduction)",
    "1/2 tsp cardamom powder",
    "Dry fruits (almonds/cashews/pistachio/raisins) optional",
    "Pinch of salt",
  ];

  const steps = [
    { title: "Roast carrots", text: "Warm ghee in a heavy Kadhai(Wok). Sauté grated carrots 8–12 min until glossy and fragrant." },
    { title: "Add milk & reduce", text: "Pour in milk. Simmer and stir often until it reduces and coats the carrots." },
    { title: "Sweeten late", text: "Add sugar only after most moisture is gone. Cook until thick and cohesive." },
    { title: "Finish", text: "Add cardamom and dry fruits. Cook 3–5 minutes more, then rest 5–10 minutes." },
  ];

  return (
    <Section id="recipe" eyebrow="Cook" title="The Recipe">
      <div className="grid2">
        <div className="card reveal">
          <h3 className="h3">Ingredients</h3>
          <ul className="list">{ingredients.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className="card reveal">
          <h3 className="h3">Method</h3>
          <ol className="steps">
            {steps.map((s) => (
              <li key={s.title} className="step">
                <div className="stepTitle">{s.title}</div>
                <div className="stepText">{s.text}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card reveal">
          <h3 className="h3">Photo note</h3>
          <p className="p">A tribute to Bhoomi Devi, this ruby-red Gajrela embodies the Sattva of the Indian kitchen. Slow-cooked in iron, it transforms sacred milk and carrots into a divine Prasad, celebrating the warmth of Sanatan culture and winter devotion.</p>
        </div>
        <div className="card reveal" aria-hidden="true">
          <img src={panImg} alt="" style={{ width: "100%", borderRadius: 14, height: 220, objectFit: "cover", border: "1px solid rgba(75,36,22,.14)" }} />
        </div>
      </div>

      <div className="note reveal">
        Pro tip: Stir more frequently as it thickens, this is where the “Royal” texture is made.
      </div>
    </Section>
  );
}

function Explanation() {
  const items = [
    { title: "Why roast carrots first?", text: "It removes raw moisture and builds a deeper, sweeter base." },
    { title: "Why slow reduction?", text: "Milk solids concentrate and bind to carrots—this is the signature richness." },
    { title: "Why sugar late?", text: "Sugar releases water. Adding it later keeps texture thick and prevents overcooking." },
    { title: "Why cardamom last?", text: "It preserves the bright floral aroma that defines great halwa." },
  ];

  return (
    <Section id="explanation" eyebrow="Understand" title="The logic behind each step">
      <div className="grid2">
        {items.map((it) => (
          <div key={it.title} className="card reveal">
            <h3 className="h3">{it.title}</h3>
            <p className="p">{it.text}</p>
          </div>
        ))}
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card reveal" aria-hidden="true">
          <img src={carrotsImg} alt="" style={{ width: "100%", borderRadius: 14, height: 220, objectFit: "cover", border: "1px solid rgba(75,36,22,.14)" }} />
        </div>
        <div className="card reveal">
          <h3 className="h3">Make it feel Indian (presentation)</h3>
          <ul className="list">
            <li>Serve in a steel bowl / mitti cup for a rooted vibe.</li>
            <li>Top with pistachio, almond slivers, and a tiny ghee gloss.</li>
            <li>Pair with warm milk or masala chai.</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

function Story() {
  const [active, setActive] = useState(0);

  return (
    <Section id="story" eyebrow="Origin" title="A story of earth, fire & devotion">
      <div className="storyGrid">
        <div className="storyRail reveal" role="tablist" aria-label="Story sections">
          {storySections.map((s, idx) => (
            <button
              key={s.title}
              className={"storyTab " + (idx === active ? "active" : "")}
              onClick={() => setActive(idx)}
              role="tab"
              aria-selected={idx === active}
              type="button"
            >
              <span className="storyRoman">{s.roman}</span>
              <span className="storyTitle">{s.title}</span>
            </button>
          ))}
        </div>

        <div className="card reveal" role="region" aria-label="Selected story">
          <h3 className="h3">{storySections[active].title}</h3>
          {storySections[active].body.map((p, i) => (
            <p key={i} className="p">{p}</p>
          ))}

          <div className="tattvaWrap">
            <div className="tattvaHead">
              <div className="eyebrow">Pancha Tattva</div>
              <div className="tattvaSub">Five elements. One slow transformation.</div>
            </div>

            <div className="tattvaGrid">
              {panchaTattva.map((t) => (
                <div key={t.key} className="tattvaCard">
                  <div className="tattvaKey">{t.key}</div>
                  <div className="tattvaSubKey">{t.subtitle}</div>
                  <div className="tattvaText">{t.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="note">
            This section is written in a cultural/spiritual tone. Like family storytelling, not a textbook.
          </div>
        </div>
      </div>
    </Section>
  );
}

function computeApproxTotals(inputs) {
  const milkRef = inputs.milk_type === "toned" ? REF.milk_toned : REF.milk_full;

  const carrot = REF.carrot;
  const carrotFactor = inputs.carrots_g / 100;
  const milkFactor = inputs.milk_g / 100;

  const base = {
    kcal: carrot.kcal * carrotFactor + milkRef.kcal * milkFactor,
    carbs: carrot.carbs * carrotFactor + milkRef.carbs * milkFactor,
    sugar: carrot.sugar * carrotFactor + milkRef.sugar * milkFactor,
    fiber: carrot.fiber * carrotFactor + 0,
    protein: carrot.protein * carrotFactor + milkRef.protein * milkFactor,
    fat: carrot.fat * carrotFactor + milkRef.fat * milkFactor,
    satfat: (milkRef.satfat ?? 0) * milkFactor,
  };

  const nuts = inputs.dry_fruits.reduce(
    (acc, df) => {
      const key = df.name.toLowerCase();
      const ref =
        key.includes("almond") ? REF.almonds :
        key.includes("cashew") ? REF.cashews :
        key.includes("raisin") ? REF.raisins :
        null;

      if (!ref) return acc;
      const f = df.grams / 100;
      return {
        kcal: acc.kcal + ref.kcal * f,
        carbs: acc.carbs + ref.carbs * f,
        sugar: acc.sugar + ref.sugar * f,
        fiber: acc.fiber + ref.fiber * f,
        protein: acc.protein + ref.protein * f,
        fat: acc.fat + ref.fat * f,
        satfat: acc.satfat + (ref.satfat ?? 0) * f,
      };
    },
    { kcal: 0, carbs: 0, sugar: 0, fiber: 0, protein: 0, fat: 0, satfat: 0 }
  );

  return {
    total: {
      kcal: base.kcal + nuts.kcal,
      carbs: base.carbs + nuts.carbs,
      sugar: base.sugar + nuts.sugar,
      fiber: base.fiber + nuts.fiber,
      protein: base.protein + nuts.protein,
      fat: base.fat + nuts.fat,
      satfat: base.satfat + nuts.satfat,
    },
  };
}

function Nutrition() {
  const computed = useMemo(() => computeApproxTotals(recipeInputs), []);
  const t = computed.total;

  // Total cooked weight changes due to evaporation. We’ll show:
  // - "Per batch inputs" (clear)
  // - "Per 100g estimate" (using a reasonable yield assumption)
  const assumedYield_g = 650; // carrots+milk reduce; adjust if your actual yield differs
  const per100Factor = 100 / assumedYield_g;

  const per100 = {
    kcal: t.kcal * per100Factor,
    carbs: t.carbs * per100Factor,
    sugar: t.sugar * per100Factor,
    fiber: t.fiber * per100Factor,
    protein: t.protein * per100Factor,
    fat: t.fat * per100Factor,
    satfat: t.satfat * per100Factor,
  };

  const macroTotal = per100.carbs + per100.fat + per100.protein;
  const carbsPct = clamp((per100.carbs / macroTotal) * 100, 0, 100);
  const fatPct = clamp((per100.fat / macroTotal) * 100, 0, 100);
  const proteinPct = clamp((per100.protein / macroTotal) * 100, 0, 100);

  return (
    <Section id="nutrition" eyebrow="Nutrition" title="Nutrition (approx.)">
      <div className="grid2">
        <div className="card reveal">
          <h3 className="h3">Per 100g (estimated)</h3>
          <div className="kcalRow">
            <div className="kcalLabel">Calories</div>
            <div className="kcalValue">{Math.round(per100.kcal)} kcal</div>
          </div>

          <div className="macroBars" aria-label="Macro distribution">
            <div className="bar">
              <div className="barLabel">Carbs</div>
              <div className="barTrack"><div className="barFill carbs" style={{ width: `${carbsPct}%` }} /></div>
              <div className="barValue">{per100.carbs.toFixed(1)}g</div>
            </div>
            <div className="bar">
              <div className="barLabel">Fat</div>
              <div className="barTrack"><div className="barFill fat" style={{ width: `${fatPct}%` }} /></div>
              <div className="barValue">{per100.fat.toFixed(1)}g</div>
            </div>
            <div className="bar">
              <div className="barLabel">Protein</div>
              <div className="barTrack"><div className="barFill protein" style={{ width: `${proteinPct}%` }} /></div>
              <div className="barValue">{per100.protein.toFixed(1)}g</div>
            </div>
          </div>

          <div className="nutritionGrid">
            <div className="nutRow"><span>Sugar</span><span>{per100.sugar.toFixed(1)} g</span></div>
            <div className="nutRow"><span>Fiber</span><span>{per100.fiber.toFixed(1)} g</span></div>
            <div className="nutRow"><span>Saturated fat</span><span>{per100.satfat.toFixed(1)} g</span></div>
          </div>

          <div className="note">
            Per-100g depends on your final yield (water evaporation), sugar and ghee.
          </div>
        </div>

        <div className="card reveal">
          <h3 className="h3">Vitamins & minerals (typical)</h3>
          <div className="nutritionGrid">
            <div className="nutRow"><span>Vitamin A</span><span>{microsPer100gTypical.vitaminA_rae_mcg} mcg RAE</span></div>
            <div className="nutRow"><span>Vitamin B6</span><span>{microsPer100gTypical.vitaminB6_mg} mg</span></div>
            <div className="nutRow"><span>Vitamin C</span><span>{microsPer100gTypical.vitaminC_mg} mg</span></div>
            <div className="nutRow"><span>Vitamin D</span><span>{microsPer100gTypical.vitaminD_mcg} mcg</span></div>
            <div className="nutRow"><span>Vitamin K</span><span>{microsPer100gTypical.vitaminK_mcg} mcg</span></div>
            <div className="nutRow"><span>Calcium</span><span>{microsPer100gTypical.calcium_mg} mg</span></div>
            <div className="nutRow"><span>Iron</span><span>{microsPer100gTypical.iron_mg} mg</span></div>
            <div className="nutRow"><span>Potassium</span><span>{microsPer100gTypical.potassium_mg} mg</span></div>
          </div>

          <div className="note">
            Dry fruits increase healthy fats, minerals, and overall calories. Milk micronutrients depend on fortification.
          </div>
        </div>
      </div>

      <div className="card reveal" style={{ marginTop: 14 }}>
        <h3 className="h3">Batch inputs used</h3>
        <ul className="list">
          <li>{recipeInputs.carrots_g}g carrots</li>
          <li>{recipeInputs.milk_g}g milk ({recipeInputs.milk_type})</li>
          <li>Dry fruits: {recipeInputs.dry_fruits.map((d) => `${d.name} ${d.grams}g`).join(", ")}</li>
        </ul>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footerInner">
        <div className="footerLeft">
          <div className="brandFoot">
            <span className="brandMark" aria-hidden="true">ग</span>
            <span className="brandText">Gajar Ka Halwa By Gaurav </span>
          </div>
          <div className="footerSmall">
            Made with love. Hosted free on Cloudflare Pages.
          </div>
        </div>
        <div className="footerRight">
          <a className="footerLink" href="#top">Back to top</a>
          <a className="footerLink" href="#recipe">Recipe</a>
          <a className="footerLink" href="#story">Origin</a>
          <a className="footerLink" href="#nutrition">Nutrition</a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  useScrollReveal();

  return (
    <div className="app">
      <Nav />
      <main>
        <Hero />
        <Recipe />
        <Explanation />
        <Story />
        <Nutrition />
      </main>
      <Footer />
    </div>
  );
}