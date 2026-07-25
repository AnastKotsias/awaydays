/**
 * Development seed data.
 *
 *   npm run db:seed
 *
 * The stadiums, their coordinates and the leagues are real. The bars, tavernas
 * and meeting points are INVENTED sample data placed at realistic distances
 * around each ground — enough to build and demo the map and itinerary features
 * without scraping or paying for a places API.
 *
 * The script wipes and rebuilds the tables it owns, so it can be run as often
 * as you like and always produces the same result.
 */
import { prisma, disconnectDb } from "./db.js";
import { offsetCoordinates } from "./lib/geo.js";
import { Sport, SpotCategory } from "./generated/prisma/enums.js";
import type { Prisma } from "./generated/prisma/client.js";

/** A date `days` from now, at a given hour, in local time. */
function daysFromNow(days: number, hour: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

type SeedSpot = {
  name: string;
  category: SpotCategory;
  description: string;
  address: string;
  /** Metres north (negative = south) of the stadium. */
  north: number;
  /** Metres east (negative = west) of the stadium. */
  east: number;
  priceLevel: number;
};

type SeedEvent = {
  homeTeam: string;
  awayTeam: string;
  sport: Sport;
  league: string;
  kickoffAt: Date;
};

type SeedStadium = {
  slug: string;
  name: string;
  city: string;
  country: string;
  blurb: string;
  latitude: number;
  longitude: number;
  capacity: number;
  events: SeedEvent[];
  spots: SeedSpot[];
};

const stadiums: SeedStadium[] = [
  {
    slug: "oaka",
    name: "Olympic Stadium (OAKA)",
    city: "Athens",
    country: "Greece",
    blurb:
      "The big one. Marousi fills up two hours before kick-off, so eat before you get near the ground.",
    latitude: 38.0366,
    longitude: 23.7873,
    capacity: 69618,
    events: [
      {
        homeTeam: "Panathinaikos",
        awayTeam: "Olympiacos",
        sport: Sport.FOOTBALL,
        league: "Super League Greece",
        kickoffAt: daysFromNow(7, 20),
      },
      {
        homeTeam: "Panathinaikos",
        awayTeam: "Ajax",
        sport: Sport.FOOTBALL,
        league: "UEFA Europa League",
        kickoffAt: daysFromNow(18, 21),
      },
    ],
    spots: [
      {
        name: "The Marousi Tap",
        category: SpotCategory.SPORTS_BAR,
        description: "Ten screens, draught beer, packed two hours before kick-off.",
        address: "Kifisias Avenue 42, Marousi",
        north: 380,
        east: 210,
        priceLevel: 2,
      },
      {
        name: "Souvlaki tou Stadiou",
        category: SpotCategory.LOCAL_FOOD,
        description: "Grill house doing pork and chicken souvlaki until late.",
        address: "Spyrou Loui 8, Marousi",
        north: -260,
        east: 340,
        priceLevel: 1,
      },
      {
        name: "Gate 12 Meeting Point",
        category: SpotCategory.FAN_MEETING_POINT,
        description: "Where visiting supporters gather before walking to the away end.",
        address: "OAKA Complex, north car park",
        north: 520,
        east: -180,
        priceLevel: 1,
      },
      {
        name: "Kafeneio Olympia",
        category: SpotCategory.CAFE,
        description: "Quiet Greek coffee and loukoumades, good for an early arrival.",
        address: "Leoforos Kifisias 61, Marousi",
        north: -640,
        east: -420,
        priceLevel: 1,
      },
      {
        name: "Irish Pub Marousi",
        category: SpotCategory.PUB,
        description: "Neutral ground with away-fan-friendly staff and Guinness on tap.",
        address: "Vasilissis Sofias 15, Marousi",
        north: 900,
        east: 640,
        priceLevel: 2,
      },
    ],
  },
  {
    slug: "karaiskakis",
    name: "Karaiskakis Stadium",
    city: "Piraeus",
    country: "Greece",
    blurb:
      "Ten minutes from the harbour. Loud from the first whistle, and the mezedes are worth arriving early for.",
    latitude: 37.9447,
    longitude: 23.6656,
    capacity: 32115,
    events: [
      {
        homeTeam: "Olympiacos",
        awayTeam: "AEK Athens",
        sport: Sport.FOOTBALL,
        league: "Super League Greece",
        kickoffAt: daysFromNow(4, 19),
      },
      {
        homeTeam: "Olympiacos",
        awayTeam: "Fiorentina",
        sport: Sport.FOOTBALL,
        league: "UEFA Conference League",
        kickoffAt: daysFromNow(21, 22),
      },
    ],
    spots: [
      {
        name: "Faliro Sports Bar",
        category: SpotCategory.SPORTS_BAR,
        description: "Terrace overlooking the marina, big screen for the early games.",
        address: "Akti Themistokleous 120, Neo Faliro",
        north: 210,
        east: -300,
        priceLevel: 2,
      },
      {
        name: "Ouzeri Mikrolimano",
        category: SpotCategory.LOCAL_FOOD,
        description: "Fresh seafood mezedes by the harbour, ten minutes on foot.",
        address: "Mikrolimano Harbour, Piraeus",
        north: 640,
        east: 780,
        priceLevel: 3,
      },
      {
        name: "Neo Faliro Station Steps",
        category: SpotCategory.FAN_MEETING_POINT,
        description: "Metro line 1 exit — the standard meet-up before away games.",
        address: "Neo Faliro Metro Station",
        north: -180,
        east: 120,
        priceLevel: 1,
      },
      {
        name: "To Steki tou Limaniou",
        category: SpotCategory.LOCAL_FOOD,
        description: "Cheap taverna plates, no menu, whatever is cooked that day.",
        address: "Skylitsi 22, Piraeus",
        north: -520,
        east: -460,
        priceLevel: 1,
      },
      {
        name: "Port Side Pub",
        category: SpotCategory.PUB,
        description: "Small, loud, and open long after the final whistle.",
        address: "Ipsilantou 8, Piraeus",
        north: 340,
        east: -820,
        priceLevel: 2,
      },
    ],
  },
  {
    slug: "sef",
    name: "Peace and Friendship Stadium",
    city: "Piraeus",
    country: "Greece",
    blurb:
      "EuroLeague nights in a concrete bowl by the sea. Tight, steep, and audible from three streets away.",
    latitude: 37.9424,
    longitude: 23.6617,
    capacity: 12373,
    events: [
      {
        homeTeam: "Olympiacos BC",
        awayTeam: "Real Madrid",
        sport: Sport.BASKETBALL,
        league: "EuroLeague",
        kickoffAt: daysFromNow(10, 21),
      },
      {
        homeTeam: "Olympiacos BC",
        awayTeam: "Panathinaikos BC",
        sport: Sport.BASKETBALL,
        league: "EuroLeague",
        kickoffAt: daysFromNow(25, 20),
      },
    ],
    spots: [
      {
        name: "Court Side Cafe",
        category: SpotCategory.CAFE,
        description: "Espresso and toasted sandwiches right outside the arena.",
        address: "Ethnarchou Makariou 3, Neo Faliro",
        north: 150,
        east: 190,
        priceLevel: 1,
      },
      {
        name: "Basket Bar 1925",
        category: SpotCategory.SPORTS_BAR,
        description: "EuroLeague on every screen, standing room only on game night.",
        address: "Dimosthenous 44, Piraeus",
        north: -420,
        east: 260,
        priceLevel: 2,
      },
      {
        name: "Psarotaverna Akti",
        category: SpotCategory.LOCAL_FOOD,
        description: "Grilled octopus and ouzo, a fifteen minute walk along the coast.",
        address: "Akti Dilaveri 5, Piraeus",
        north: 720,
        east: 950,
        priceLevel: 3,
      },
      {
        name: "SEF Forecourt",
        category: SpotCategory.FAN_MEETING_POINT,
        description: "Open square in front of the arena where coaches drop fans off.",
        address: "SEF main entrance, Neo Faliro",
        north: -90,
        east: -140,
        priceLevel: 1,
      },
    ],
  },
  {
    slug: "toumba",
    name: "Toumba Stadium",
    city: "Thessaloniki",
    country: "Greece",
    blurb:
      "The away end is close enough to hear the home end breathe. Bougatsa first, everything else after.",
    latitude: 40.6244,
    longitude: 22.972,
    capacity: 28701,
    events: [
      {
        homeTeam: "PAOK",
        awayTeam: "Aris",
        sport: Sport.FOOTBALL,
        league: "Super League Greece",
        kickoffAt: daysFromNow(12, 19),
      },
    ],
    spots: [
      {
        name: "Toumba Beer House",
        category: SpotCategory.PUB,
        description: "Local microbrews, a five minute walk from the away turnstiles.",
        address: "Mikras Asias 40, Thessaloniki",
        north: 260,
        east: 300,
        priceLevel: 2,
      },
      {
        name: "Bougatsa Thessaloniki",
        category: SpotCategory.LOCAL_FOOD,
        description: "The city's signature pastry, sweet or cheese, open from dawn.",
        address: "Papanastasiou 88, Thessaloniki",
        north: -380,
        east: -240,
        priceLevel: 1,
      },
      {
        name: "Kleanthis Square",
        category: SpotCategory.FAN_MEETING_POINT,
        description: "Square where the pre-match march assembles.",
        address: "Plateia Kleanthi, Thessaloniki",
        north: 480,
        east: -520,
        priceLevel: 1,
      },
      {
        name: "Sports Cafe Nea Elvetia",
        category: SpotCategory.SPORTS_BAR,
        description: "Big terrace, cheap jugs, popular with travelling supporters.",
        address: "Karakasi 12, Thessaloniki",
        north: -700,
        east: 610,
        priceLevel: 1,
      },
    ],
  },
];

async function main() {
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("Refusing to run the development seed against production.");
  }

  // Delete children before parents so no foreign key is ever left dangling.
  // (Cascades would handle most of this, but being explicit documents the
  // dependency order and keeps the script honest.)
  await prisma.itineraryItem.deleteMany();
  await prisma.itinerary.deleteMany();
  await prisma.spotReview.deleteMany();
  await prisma.spot.deleteMany();
  await prisma.event.deleteMany();
  await prisma.stadium.deleteMany();

  for (const stadium of stadiums) {
    const origin = {
      latitude: stadium.latitude,
      longitude: stadium.longitude,
    };

    const spots: Prisma.SpotCreateWithoutStadiumInput[] = stadium.spots.map(
      (spot) => {
        const { latitude, longitude } = offsetCoordinates(
          origin,
          spot.north,
          spot.east,
        );
        return {
          name: spot.name,
          category: spot.category,
          description: spot.description,
          address: spot.address,
          latitude,
          longitude,
          priceLevel: spot.priceLevel,
        };
      },
    );

    await prisma.stadium.create({
      data: {
        slug: stadium.slug,
        name: stadium.name,
        city: stadium.city,
        country: stadium.country,
        blurb: stadium.blurb,
        latitude: stadium.latitude,
        longitude: stadium.longitude,
        capacity: stadium.capacity,
        // Nested writes: Prisma inserts the stadium, then its events and
        // spots with the right foreign key, all in one transaction.
        events: { create: stadium.events },
        spots: { create: spots },
      },
    });
  }

  const [stadiumCount, eventCount, spotCount] = await Promise.all([
    prisma.stadium.count(),
    prisma.event.count(),
    prisma.spot.count(),
  ]);

  console.log(
    `Seeded ${stadiumCount} stadiums, ${eventCount} events, ${spotCount} spots.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(disconnectDb);
