/**
 * Cult Film Curtis - x402 Payment-Enabled Cult Movie Recommendation Agent
 * 
 * Uses @daydreamsai/facilitator v2 with Elysia middleware
 */

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { createFacilitator } from "@daydreamsai/facilitator";
import { createPrivateKeyEvmSigner } from "@daydreamsai/facilitator/signers";
import { createElysiaPaidRoutes } from "@daydreamsai/facilitator/elysia";

// ============================================
// Configuration
// ============================================

const PORT = Number(process.env.PORT) || 8090;
const PRICE_USDC = "0.01";
const PRICE_MICRO_USDC = "10000"; // 0.01 * 1_000_000
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const AGENT_VERSION = "1.0.0";
const BASE_NETWORK = "eip155:8453";

// Validate environment
if (!process.env.EVM_PRIVATE_KEY) {
  console.error("❌ EVM_PRIVATE_KEY is required");
  process.exit(1);
}

// ============================================
// Facilitator Setup (EVM Private Key Signer)
// ============================================

const evmSigner = createPrivateKeyEvmSigner({
  network: "base",
  privateKey: process.env.EVM_PRIVATE_KEY as `0x${string}`,
  rpcUrl: process.env.EVM_RPC_URL || "https://mainnet.base.org",
});

const facilitator = createFacilitator({
  evmSigners: [{
    signer: evmSigner,
    networks: BASE_NETWORK,
    schemes: ["exact"],
  }],
});

// Get wallet address from signer
const walletAddress = evmSigner.address;

// ============================================
// Cult Film Database
// ============================================

interface CultFilm {
  id: string;
  title: string;
  year: number;
  director: string;
  genre: string[];
  runtime_min: number;
  rating: number;
  synopsis: string;
  why_cult: string;
  viewing_tips: string;
  availability: string[];
  discourse_score: number;
}

const CULT_FILMS: CultFilm[] = [
  {
    id: "the-room",
    title: "The Room",
    year: 2003,
    director: "Tommy Wiseau",
    genre: ["drama", "romance", "unintentional-comedy"],
    runtime_min: 99,
    rating: 3.9,
    synopsis: "Johnny is a successful banker who lives in San Francisco with his fiancée Lisa. One day, inexplicably, she gets bored with him and seduces his best friend Mark.",
    why_cult: "Widely considered the 'Citizen Kane of bad movies.' Tommy Wiseau's mysterious origins, the inexplicable dialogue, and the legendary 'Oh hi Mark' scene have made this a midnight movie staple.",
    viewing_tips: "Best watched with friends. Bring plastic spoons to throw at the screen during the framed spoon photos. Prepare for the rooftop scenes.",
    availability: ["Amazon Prime", "Vudu", "YouTube"],
    discourse_score: 9,
  },
  {
    id: "eraserhead",
    title: "Eraserhead",
    year: 1977,
    director: "David Lynch",
    genre: ["horror", "surrealist", "art-film"],
    runtime_min: 89,
    rating: 7.3,
    synopsis: "Henry Spencer tries to survive his industrial environment, his angry girlfriend, and the unbearable screams of his newborn mutant child.",
    why_cult: "Lynch's debut feature took five years to make and defined American surrealist cinema. The baby prop's construction remains a closely guarded secret.",
    viewing_tips: "Watch alone, in the dark, with good speakers. Don't try to 'understand' it—feel it. The industrial soundscape is half the experience.",
    availability: ["Criterion Channel", "HBO Max", "Physical media"],
    discourse_score: 8,
  },
  {
    id: "videodrome",
    title: "Videodrome",
    year: 1983,
    director: "David Cronenberg",
    genre: ["horror", "sci-fi", "body-horror"],
    runtime_min: 87,
    rating: 7.2,
    synopsis: "A TV executive discovers a broadcast signal featuring extreme content that causes hallucinations and physical transformations.",
    why_cult: "Cronenberg predicted media's effect on consciousness decades early. 'Long live the new flesh' became a techno-philosophy rallying cry.",
    viewing_tips: "Consider that this was made before the internet. The practical effects by Rick Baker still disturb. The TV/VHS motifs hit different now.",
    availability: ["Criterion Channel", "Shudder", "Physical media"],
    discourse_score: 9,
  },
  {
    id: "mandy",
    title: "Mandy",
    year: 2018,
    director: "Panos Cosmatos",
    genre: ["action", "horror", "revenge"],
    runtime_min: 121,
    rating: 6.5,
    synopsis: "A man hunts the nightmarish religious cult that murdered his lover, descending into a psychedelic hellscape of violence.",
    why_cult: "Nicolas Cage at his most unhinged, which is saying something. The chainsaw fight. The Cheddar Goblin commercial. King Crimson needle drops.",
    viewing_tips: "The first hour is slow and dreamlike ON PURPOSE. Everything after the bathroom scene is pure rage fuel. Cage's scream is cathartic.",
    availability: ["Shudder", "Amazon Prime", "Physical media"],
    discourse_score: 9,
  },
  {
    id: "hausu",
    title: "Hausu (House)",
    year: 1977,
    director: "Nobuhiko Obayashi",
    genre: ["horror", "comedy", "experimental"],
    runtime_min: 88,
    rating: 7.5,
    synopsis: "A schoolgirl and her friends visit her aunt's country house, which turns out to be haunted and hungry.",
    why_cult: "Japanese studio Toho asked a commercial director to make a Jaws-like hit. He asked his young daughter what scared her. The result is utterly unhinged.",
    viewing_tips: "Don't blink. Every frame contains deliberate chaos. The piano scene is iconic. Embrace the absurdity.",
    availability: ["Criterion Channel", "HBO Max", "Physical media"],
    discourse_score: 8,
  },
  {
    id: "possession-1981",
    title: "Possession",
    year: 1981,
    director: "Andrzej Żuławski",
    genre: ["horror", "drama", "psychological"],
    runtime_min: 124,
    rating: 7.3,
    synopsis: "A spy returns home to find his wife asking for a divorce, but her reasons involve something far more disturbing than another man.",
    why_cult: "Isabelle Adjani's subway scene is the most committed acting performance ever filmed. Shot in West Berlin, the Wall becomes a character.",
    viewing_tips: "Everyone is acting at 11. That's intentional—Żuławski wanted the emotional truth of divorce externalized. The creature design is unforgettable.",
    availability: ["Metrograph", "Physical media"],
    discourse_score: 8,
  },
  {
    id: "holy-mountain",
    title: "The Holy Mountain",
    year: 1973,
    director: "Alejandro Jodorowsky",
    genre: ["adventure", "surrealist", "spiritual"],
    runtime_min: 114,
    rating: 7.9,
    synopsis: "A Christlike figure joins a group representing planets in the solar system on a quest to the Holy Mountain to displace the gods.",
    why_cult: "Funded by Beatles manager Allen Klein after El Topo. Jodorowsky literally threw the I Ching to write scenes. The ending breaks the fourth wall forever.",
    viewing_tips: "Accept that you won't understand everything. Each planetary character represents tarot arcana. The 'Zoom back, camera' ending is legendary.",
    availability: ["Amazon Prime", "Physical media"],
    discourse_score: 7,
  },
  {
    id: "tetsuo",
    title: "Tetsuo: The Iron Man",
    year: 1989,
    director: "Shinya Tsukamoto",
    genre: ["horror", "sci-fi", "cyberpunk"],
    runtime_min: 67,
    rating: 7.0,
    synopsis: "A businessman begins transforming into a walking pile of scrap metal after a hit-and-run accident.",
    why_cult: "Shot in 16mm black and white over 18 months on a tiny budget. Influenced everything from Nine Inch Nails videos to The Matrix.",
    viewing_tips: "67 minutes of pure sensory assault. The stop-motion metallic growths are hypnotic. Industrial soundtrack by Chu Ishikawa is essential.",
    availability: ["Arrow Player", "Physical media"],
    discourse_score: 7,
  },
  {
    id: "donnie-darko",
    title: "Donnie Darko",
    year: 2001,
    director: "Richard Kelly",
    genre: ["drama", "sci-fi", "psychological"],
    runtime_min: 113,
    rating: 8.0,
    synopsis: "A troubled teenager is visited by a man in a rabbit suit who tells him the world will end in 28 days, 6 hours, 42 minutes, and 12 seconds.",
    why_cult: "Flopped at release (bad timing—October 2001) then became a DVD phenomenon. Launched a thousand dorm room posters and philosophy discussions.",
    viewing_tips: "The theatrical cut is better than the director's cut. The website's 'Philosophy of Time Travel' fills gaps.",
    availability: ["Amazon Prime", "Hulu", "Physical media"],
    discourse_score: 8,
  },
  {
    id: "evil-dead",
    title: "The Evil Dead",
    year: 1981,
    director: "Sam Raimi",
    genre: ["horror", "comedy"],
    runtime_min: 85,
    rating: 7.4,
    synopsis: "Five friends travel to a cabin in the woods where they discover a book and recording that unleash demonic forces.",
    why_cult: "Made for $350,000 with innovative camera techniques. Raimi strapped the camera to a 2x4 for the 'evil force' POV. Stephen King's endorsement launched it.",
    viewing_tips: "This is the scary one; Evil Dead 2 is the funny one. The practical effects are gloriously grotesque. Bruce Campbell's chin deserves its own credit.",
    availability: ["Netflix", "Tubi", "Physical media"],
    discourse_score: 7,
  },
  {
    id: "society",
    title: "Society",
    year: 1989,
    director: "Brian Yuzna",
    genre: ["horror", "comedy", "satire"],
    runtime_min: 99,
    rating: 6.5,
    synopsis: "A Beverly Hills teenager suspects his wealthy family might be hiding something inhuman beneath their polished surface.",
    why_cult: "The 'shunting' climax is one of the most insane practical effects sequences ever filmed. Screaming Mad George's creature work is legendary.",
    viewing_tips: "Stick with it—the first hour is setup for one of horror's greatest payoffs. The class satire is still relevant. That ending will stay with you.",
    availability: ["Arrow Player", "Shudder", "Physical media"],
    discourse_score: 7,
  },
  {
    id: "repo-man",
    title: "Repo Man",
    year: 1984,
    director: "Alex Cox",
    genre: ["sci-fi", "comedy", "punk"],
    runtime_min: 92,
    rating: 6.9,
    synopsis: "A young punk rocker becomes a car repossession agent and gets caught up in a chase for a Chevy Malibu with something mysterious in its trunk.",
    why_cult: "Captures the Reagan-era punk ethos perfectly. The generic 'FOOD' and 'DRINK' products, Harry Dean Stanton's repo code philosophy, and that ending.",
    viewing_tips: "Pay attention to every background detail—the generic products are everywhere. The Iggy Pop soundtrack is essential.",
    availability: ["Criterion Channel", "Tubi", "Physical media"],
    discourse_score: 7,
  },
];

// ============================================
// Core Service Logic
// ============================================

interface MovieRecommendation {
  recommendation: {
    id: string;
    title: string;
    year: number;
    director: string;
    genre: string[];
    runtime_min: number;
    rating: number;
    synopsis: string;
    why_cult: string;
    viewing_tips: string;
    availability: string[];
  };
  metadata: {
    source: string;
    version: string;
    timestamp: string;
    discourse_score: number;
    curator: string;
  };
}

function getRandomCultFilm(): CultFilm {
  const totalWeight = CULT_FILMS.reduce((sum, film) => sum + film.discourse_score, 0);
  let random = Math.random() * totalWeight;
  
  for (const film of CULT_FILMS) {
    random -= film.discourse_score;
    if (random <= 0) return film;
  }
  return CULT_FILMS[0];
}

function formatRecommendation(film: CultFilm): MovieRecommendation {
  return {
    recommendation: {
      id: film.id,
      title: film.title,
      year: film.year,
      director: film.director,
      genre: film.genre,
      runtime_min: film.runtime_min,
      rating: film.rating,
      synopsis: film.synopsis,
      why_cult: film.why_cult,
      viewing_tips: film.viewing_tips,
      availability: film.availability,
    },
    metadata: {
      source: "cult-film-curtis",
      version: AGENT_VERSION,
      timestamp: new Date().toISOString(),
      discourse_score: film.discourse_score,
      curator: "Curtis",
    },
  };
}

// ============================================
// Elysia App with Paid Routes
// ============================================

const app = new Elysia()
  .use(cors())
  
  // Public endpoints (no payment required)
  .get("/", () => ({
    name: "Cult Film Curtis",
    description: "Curtis is a movie loving connoisseur. Call him for an idea of a cult movie to watch.",
    version: AGENT_VERSION,
    endpoints: {
      main: {
        path: "/cultmovieidea",
        method: "POST",
        price: { amount: PRICE_USDC, currency: "USDC", network: "base" },
      },
    },
    payment: {
      protocol: "x402",
      version: "v2",
      network: "base",
      chainId: BASE_NETWORK,
      token: USDC_ADDRESS,
      recipient: walletAddress,
    },
    catalog_size: CULT_FILMS.length,
  }))
  
  .get("/health", () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: AGENT_VERSION,
  }));

// Add payment-protected routes
const paidRoutes = createElysiaPaidRoutes(app, {
  middleware: {
    facilitatorClient: facilitator,
    autoSettle: true,
  },
});

// Handler for cult movie recommendation
const cultMovieHandler = () => {
  const film = getRandomCultFilm();
  const recommendation = formatRecommendation(film);
  return {
    ...recommendation,
    payment: {
      status: "verified",
      amount: PRICE_USDC,
      currency: "USDC",
    },
  };
};

const paymentConfig = {
  payment: {
    accepts: {
      scheme: "exact",
      network: BASE_NETWORK,
      payTo: walletAddress,
      price: {
        asset: USDC_ADDRESS,
        amount: PRICE_MICRO_USDC,
      },
    },
    description: "Get a cult film recommendation from Curtis",
  },
};

// Support both GET and POST for browser and API compatibility
paidRoutes.get("/cultmovieidea", cultMovieHandler, paymentConfig);
paidRoutes.post("/cultmovieidea", cultMovieHandler, paymentConfig);

// Start server
app.listen(PORT);

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    CULT FILM CURTIS                       ║
║              x402 Payment-Enabled Movie Oracle            ║
╠═══════════════════════════════════════════════════════════╣
║  Status:    🟢 Running                                    ║
║  Port:      ${PORT.toString().padEnd(44)}║
║  Address:   ${walletAddress.slice(0, 42).padEnd(44)}║
║  Price:     ${PRICE_USDC} USDC per recommendation              ║
║  Catalog:   ${CULT_FILMS.length.toString().padEnd(3)} cult films                              ║
║  Protocol:  x402 v2 (exact scheme)                        ║
╠═══════════════════════════════════════════════════════════╣
║  Endpoints:                                               ║
║    GET  /                    Agent info                   ║
║    GET  /health              Health check                 ║
║    POST /cultmovieidea       Get recommendation (paid)    ║
╚═══════════════════════════════════════════════════════════╝
`);

export type App = typeof app;
