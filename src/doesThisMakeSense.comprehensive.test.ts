import { describe, it, expect } from "bun:test";
import { doesThisMakeSense } from "./doesThisMakeSense";

describe("doesThisMakeSense - Comprehensive Validation Tests", () => {
  const seed = 1;

  describe("Empty Context - Should REJECT ALL actions", () => {
    it("rejects movement with no context", async () => {
      const res = await doesThisMakeSense({
        messages: [
          { role: "system", content: "You are a game master." },
          { role: "user", content: "I go north" },
        ],
        seed,
      });
      expect(res.makesSense, res.reasoning).toBe(false);
    });

    it("rejects taking items with no context", async () => {
      const res = await doesThisMakeSense({
        messages: [
          { role: "system", content: "You are a game master." },
          { role: "user", content: "I take the sword" },
        ],
        seed,
      });
      expect(res.makesSense, res.reasoning).toBe(false);
    });

    it("rejects opening doors with no context", async () => {
      const res = await doesThisMakeSense({
        messages: [
          { role: "system", content: "You are a game master." },
          { role: "user", content: "I open the door" },
        ],
        seed,
      });
      expect(res.makesSense, res.reasoning).toBe(false);
    });

    it("allows ONLY meta requests with no context", async () => {
      const res = await doesThisMakeSense({
        messages: [
          { role: "system", content: "You are a game master." },
          {
            role: "user",
            content:
              "Generate a description of the room I'm in. Start the game.",
          },
        ],
        seed,
      });
      expect(res.makesSense, res.reasoning).toBe(true);
    });
  });

  describe("Rich Fantasy Dungeon Context", () => {
    const dungeonContext = {
      messages: [
        {
          role: "system",
          content:
            "You are a game master for a fantasy dungeon crawler RPG.",
        },
        {
          role: "assistant",
          content: `You stand in a dimly lit stone corridor, torches flickering on the walls.
          To your north, a heavy iron door stands closed but unlocked. To your south, the corridor
          continues into darkness. A rusty sword lies on the ground near your feet, and you hear
          the distant sound of dripping water echoing from somewhere ahead. Your leather pack
          contains a rope, a torch, and a small vial of healing potion. A skeleton in ancient
          armor slumps against the eastern wall, long dead.`,
        },
      ],
      seed,
    };

    describe("Valid Actions", () => {
      it("allows picking up visible items", async () => {
        const res = await doesThisMakeSense({
          ...dungeonContext,
          messages: [
            ...dungeonContext.messages,
            { role: "user", content: "I pick up the rusty sword" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows movement through described exits", async () => {
        const res = await doesThisMakeSense({
          ...dungeonContext,
          messages: [
            ...dungeonContext.messages,
            { role: "user", content: "I go north through the iron door" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows examining the environment", async () => {
        const res = await doesThisMakeSense({
          ...dungeonContext,
          messages: [
            ...dungeonContext.messages,
            {
              role: "user",
              content: "I examine the skeleton's armor for anything useful",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows using items from inventory", async () => {
        const res = await doesThisMakeSense({
          ...dungeonContext,
          messages: [
            ...dungeonContext.messages,
            { role: "user", content: "I light my torch" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows drinking the healing potion", async () => {
        const res = await doesThisMakeSense({
          ...dungeonContext,
          messages: [
            ...dungeonContext.messages,
            { role: "user", content: "I drink the healing potion" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows listening for sounds", async () => {
        const res = await doesThisMakeSense({
          ...dungeonContext,
          messages: [
            ...dungeonContext.messages,
            {
              role: "user",
              content: "I listen carefully to determine where the water sound is coming from",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });
    });

    describe("Invalid Actions", () => {
      it("rejects taking items that don't exist", async () => {
        const res = await doesThisMakeSense({
          ...dungeonContext,
          messages: [
            ...dungeonContext.messages,
            { role: "user", content: "I take the diamond crown" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects flying", async () => {
        const res = await doesThisMakeSense({
          ...dungeonContext,
          messages: [
            ...dungeonContext.messages,
            { role: "user", content: "I fly over the corridor" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects summoning creatures", async () => {
        const res = await doesThisMakeSense({
          ...dungeonContext,
          messages: [
            ...dungeonContext.messages,
            { role: "user", content: "I summon a fire elemental" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects controlling the skeleton", async () => {
        const res = await doesThisMakeSense({
          ...dungeonContext,
          messages: [
            ...dungeonContext.messages,
            { role: "user", content: "The skeleton stands up and follows me" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });
    });
  });

  describe("Elaborate Merchant Shop Context", () => {
    const shopContext = {
      messages: [
        {
          role: "system",
          content: "You are a game master for a fantasy RPG.",
        },
        {
          role: "assistant",
          content: `You enter Grimble's General Goods, a cozy shop filled with the scent
          of herbs and leather. Grimble, a portly halfling with a welcoming smile, stands
          behind the counter polishing a copper mug. The shelves are stocked with various
          goods: bundles of rope (10 gold each), healing salves (25 gold), dried rations
          (5 gold per week's worth), and iron daggers (15 gold). A sign reads "No Credit -
          Cash Only!" You have 50 gold pieces in your coin purse. A black cat sleeps on
          the windowsill, and soft rain patters against the windows outside.`,
        },
      ],
      seed,
    };

    describe("Valid Actions", () => {
      it("allows asking about merchandise", async () => {
        const res = await doesThisMakeSense({
          ...shopContext,
          messages: [
            ...shopContext.messages,
            {
              role: "user",
              content: "I ask Grimble about the quality of the healing salves",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows attempting to buy items", async () => {
        const res = await doesThisMakeSense({
          ...shopContext,
          messages: [
            ...shopContext.messages,
            {
              role: "user",
              content: "I offer to buy two bundles of rope for 20 gold",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows attempting to negotiate", async () => {
        const res = await doesThisMakeSense({
          ...shopContext,
          messages: [
            ...shopContext.messages,
            {
              role: "user",
              content: "I try to haggle for a better price on the daggers",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows petting the cat", async () => {
        const res = await doesThisMakeSense({
          ...shopContext,
          messages: [
            ...shopContext.messages,
            { role: "user", content: "I gently pet the sleeping cat" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows looking around the shop", async () => {
        const res = await doesThisMakeSense({
          ...shopContext,
          messages: [
            ...shopContext.messages,
            {
              role: "user",
              content: "I examine the shelves for anything unusual or rare",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows attempting to steal (even if unwise)", async () => {
        const res = await doesThisMakeSense({
          ...shopContext,
          messages: [
            ...shopContext.messages,
            {
              role: "user",
              content:
                "I try to sneakily pocket a dagger while Grimble isn't looking",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });
    });

    describe("Invalid Actions", () => {
      it("rejects controlling Grimble's actions", async () => {
        const res = await doesThisMakeSense({
          ...shopContext,
          messages: [
            ...shopContext.messages,
            {
              role: "user",
              content: "Grimble gives me all his goods for free",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects narrating NPC dialogue", async () => {
        const res = await doesThisMakeSense({
          ...shopContext,
          messages: [
            ...shopContext.messages,
            {
              role: "user",
              content:
                "Grimble says 'You're my favorite customer, have anything you want!'",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects inventing items", async () => {
        const res = await doesThisMakeSense({
          ...shopContext,
          messages: [
            ...shopContext.messages,
            {
              role: "user",
              content: "I pull out a magic scroll I have in my pack",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects impossible physics", async () => {
        const res = await doesThisMakeSense({
          ...shopContext,
          messages: [
            ...shopContext.messages,
            { role: "user", content: "I phase through the wall to the backroom" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });
    });
  });

  describe("Complex Wilderness Survival Context", () => {
    const wildernessContext = {
      messages: [
        {
          role: "system",
          content: "You are a game master for a survival RPG.",
        },
        {
          role: "assistant",
          content: `You're deep in the Whispering Woods, three days from the nearest village.
          Night is falling, and the temperature is dropping. You're at a small clearing beside
          a burbling stream. Your supplies are running low: you have a bedroll, flint and steel,
          a hunting knife, and half a day's worth of dried meat. Dense pine trees surround the
          clearing, their branches heavy with dry needles. You notice animal tracks in the soft
          earth near the stream - possibly deer. Dark clouds gather overhead, suggesting rain soon.
          You're exhausted from walking all day and your stomach growls with hunger.`,
        },
      ],
      seed,
    };

    describe("Valid Actions", () => {
      it("allows gathering firewood", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            {
              role: "user",
              content:
                "I gather dry pine needles and fallen branches for a fire",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows starting a fire with tools", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            {
              role: "user",
              content: "I use my flint and steel to start a campfire",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows hunting/tracking", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            {
              role: "user",
              content: "I follow the deer tracks to see if I can hunt for food",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows drinking from the stream", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            { role: "user", content: "I drink water from the stream" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows setting up shelter", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            {
              role: "user",
              content:
                "I set up my bedroll under the densest pine tree to shelter from rain",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows eating existing rations", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            {
              role: "user",
              content: "I eat some of my dried meat to curb my hunger",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows foraging for food", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            {
              role: "user",
              content: "I search the area for edible berries or mushrooms",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows making tools from materials", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            {
              role: "user",
              content:
                "I try to fashion a simple fishing spear from a straight branch",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });
    });

    describe("Invalid Actions", () => {
      it("rejects pulling items from nowhere", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            { role: "user", content: "I take out my tent and set it up" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects conjuring resources", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            { role: "user", content: "A roasted chicken appears before me" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects controlling weather", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            { role: "user", content: "The rain clouds disperse" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects summoning animals", async () => {
        const res = await doesThisMakeSense({
          ...wildernessContext,
          messages: [
            ...wildernessContext.messages,
            { role: "user", content: "I summon a deer to come to me" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });
    });
  });

  describe("Dangerous Situation Context", () => {
    const combatContext = {
      messages: [
        {
          role: "system",
          content: "You are a game master for an action RPG.",
        },
        {
          role: "assistant",
          content: `A massive ogre blocks the stone bridge, wielding a tree trunk as a club.
          Its beady eyes lock onto you as it roars a challenge. You have your trusty longsword
          in hand, a wooden shield strapped to your arm, and a throwing dagger in your belt.
          The bridge is narrow - barely wide enough for two people. Below, a raging river crashes
          against rocks fifty feet down. Behind you, the path back is clear but leads to the
          bandit camp you just escaped. To your left, a rocky cliff face rises steeply. The ogre
          is advancing toward you, each step making the bridge shudder.`,
        },
      ],
      seed,
    };

    describe("Valid Actions - Combat", () => {
      it("allows attacking with equipped weapons", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            {
              role: "user",
              content: "I raise my shield and slash at the ogre with my longsword",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows defensive actions", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            {
              role: "user",
              content: "I brace myself behind my shield, preparing to block",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows using throwing weapons", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            {
              role: "user",
              content: "I hurl my throwing dagger at the ogre's face",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows retreating", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            {
              role: "user",
              content:
                "I turn and run back down the path, away from the ogre",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows dangerous tactical maneuvers", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            {
              role: "user",
              content:
                "I feint left then dive and roll past the ogre to get behind it",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows climbing in desperation", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            {
              role: "user",
              content:
                "I sheathe my sword and attempt to climb the rocky cliff face to escape",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows extremely dangerous decisions", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            {
              role: "user",
              content: "I jump off the bridge into the raging river below",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows negotiation attempts", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            {
              role: "user",
              content:
                "I lower my weapon and shout 'Wait! I don't want to fight!'",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });
    });

    describe("Invalid Actions - Combat", () => {
      it("rejects controlling the ogre", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            { role: "user", content: "The ogre turns and walks away" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects using non-existent items", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            { role: "user", content: "I fire my crossbow at the ogre" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects impossible physics", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            { role: "user", content: "I teleport behind the ogre" },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects instant kills through narration", async () => {
        const res = await doesThisMakeSense({
          ...combatContext,
          messages: [
            ...combatContext.messages,
            {
              role: "user",
              content: "The ogre falls dead from a heart attack",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });
    });
  });

  describe("Social Interaction Context", () => {
    const socialContext = {
      messages: [
        {
          role: "system",
          content: "You are a game master for a political intrigue RPG.",
        },
        {
          role: "assistant",
          content: `You're at the Grand Ball in the Royal Palace, wearing your finest clothes.
          Lady Merriweather, a powerful noble known for her sharp wit and even sharper grudges,
          approaches you with a crystalline glass of wine. Her emerald necklace catches the
          candlelight. She smiles, but her eyes are calculating. "I hear you've been asking
          questions about the Duke's disappearance," she says coolly. Around you, other nobles
          dance and chatter. The orchestra plays a elegant waltz. You notice Lord Pemberton
          watching your conversation from across the room, his hand resting on his sword hilt.`,
        },
      ],
      seed,
    };

    describe("Valid Actions - Social", () => {
      it("allows diplomatic responses", async () => {
        const res = await doesThisMakeSense({
          ...socialContext,
          messages: [
            ...socialContext.messages,
            {
              role: "user",
              content:
                "I smile politely and say 'Just idle curiosity, my lady. Surely you understand.'",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows deception attempts", async () => {
        const res = await doesThisMakeSense({
          ...socialContext,
          messages: [
            ...socialContext.messages,
            {
              role: "user",
              content:
                "I lie smoothly, 'I haven't heard anything about that. Who's been spreading such rumors?'",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows observing others", async () => {
        const res = await doesThisMakeSense({
          ...socialContext,
          messages: [
            ...socialContext.messages,
            {
              role: "user",
              content:
                "While responding, I watch Lord Pemberton's reaction carefully",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows changing the subject", async () => {
        const res = await doesThisMakeSense({
          ...socialContext,
          messages: [
            ...socialContext.messages,
            {
              role: "user",
              content:
                "I deflect, 'What a magnificent necklace! Is it from the Southern mines?'",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows accepting offered items", async () => {
        const res = await doesThisMakeSense({
          ...socialContext,
          messages: [
            ...socialContext.messages,
            {
              role: "user",
              content:
                "I accept the wine glass from Lady Merriweather with a gracious nod",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows suspicious actions", async () => {
        const res = await doesThisMakeSense({
          ...socialContext,
          messages: [
            ...socialContext.messages,
            {
              role: "user",
              content:
                "I pretend to drink but don't actually swallow, worried the wine might be poisoned",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows excusing oneself", async () => {
        const res = await doesThisMakeSense({
          ...socialContext,
          messages: [
            ...socialContext.messages,
            {
              role: "user",
              content:
                "I bow slightly and say 'Please excuse me, I see someone I must speak with'",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });
    });

    describe("Invalid Actions - Social", () => {
      it("rejects controlling Lady Merriweather's reaction", async () => {
        const res = await doesThisMakeSense({
          ...socialContext,
          messages: [
            ...socialContext.messages,
            {
              role: "user",
              content: "Lady Merriweather believes my story completely",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects narrating NPC actions", async () => {
        const res = await doesThisMakeSense({
          ...socialContext,
          messages: [
            ...socialContext.messages,
            {
              role: "user",
              content: "Lord Pemberton looks away and loses interest",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects pulling items from thin air", async () => {
        const res = await doesThisMakeSense({
          ...socialContext,
          messages: [
            ...socialContext.messages,
            {
              role: "user",
              content: "I show her the secret documents I found",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });

      it("rejects mind control", async () => {
        const res = await doesThisMakeSense({
          ...socialContext,
          messages: [
            ...socialContext.messages,
            {
              role: "user",
              content: "I command her to tell me everything she knows",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });
    });
  });

  describe("Multi-Interaction Contexts - Complex Conversations", () => {
    describe("Extended NPC Dialogue", () => {
      const conversationContext = {
        messages: [
          {
            role: "system",
            content: "You are a game master for a mystery RPG.",
          },
          {
            role: "assistant",
            content: `You're in the dusty study of Professor Blackwood. Books and scrolls
            are piled everywhere. The old professor peers at you over his spectacles.`,
          },
          {
            role: "user",
            content: "I ask the professor about the strange artifact I found.",
          },
          {
            role: "assistant",
            content: `Professor Blackwood adjusts his spectacles and examines the artifact
            closely. "Fascinating! This appears to be a Celestial Key from the Third Age.
            Where did you find this?" He sets it carefully on his desk next to a magnifying
            glass and an ancient tome titled 'Relics of Power'. His hands tremble slightly
            with excitement.`,
          },
          {
            role: "user",
            content: "I tell him I found it in the abandoned temple ruins.",
          },
          {
            role: "assistant",
            content: `"The temple ruins? My word!" The professor stands abruptly, knocking
            over a stack of papers. "That temple has been sealed for centuries. If the seal
            is broken..." He trails off, looking worried. He walks to his bookshelf and pulls
            out a leather-bound journal. "I need to show you something. These are my notes
            from thirty years ago." The journal lies open on the desk, showing sketches of
            similar artifacts.`,
          },
        ],
        seed: 1,
      };

      it("allows continuing the conversation naturally", async () => {
        const res = await doesThisMakeSense({
          ...conversationContext,
          messages: [
            ...conversationContext.messages,
            {
              role: "user",
              content: "I lean in to examine the journal sketches closely",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows asking follow-up questions", async () => {
        const res = await doesThisMakeSense({
          ...conversationContext,
          messages: [
            ...conversationContext.messages,
            {
              role: "user",
              content:
                "I ask 'What happens if the seal is broken? Is there danger?'",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows interacting with newly mentioned items", async () => {
        const res = await doesThisMakeSense({
          ...conversationContext,
          messages: [
            ...conversationContext.messages,
            {
              role: "user",
              content: "I pick up the magnifying glass to examine the key more closely",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows reading revealed documents", async () => {
        const res = await doesThisMakeSense({
          ...conversationContext,
          messages: [
            ...conversationContext.messages,
            {
              role: "user",
              content: "I read through the journal pages to learn more",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("rejects inventing new information", async () => {
        const res = await doesThisMakeSense({
          ...conversationContext,
          messages: [
            ...conversationContext.messages,
            {
              role: "user",
              content:
                "I show him the second artifact I also found at the temple",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });
    });

    describe("Multi-Turn Combat Sequence", () => {
      const combatSequenceContext = {
        messages: [
          {
            role: "system",
            content: "You are a game master for a tactical combat RPG.",
          },
          {
            role: "assistant",
            content: `You face a goblin raider in the narrow cave passage. You have your
            shortsword drawn and a buckler on your arm. The goblin has a rusty dagger.`,
          },
          {
            role: "user",
            content: "I slash at the goblin with my shortsword!",
          },
          {
            role: "assistant",
            content: `Your blade slices across the goblin's shoulder, drawing blood. It
            shrieks in pain and anger, stumbling back against the cave wall. The goblin
            clutches its wounded shoulder with one hand but keeps the dagger raised
            defensively. You notice it's bleeding but still dangerous. A rusty helmet
            lies on the ground between you, knocked loose in the scuffle.`,
          },
          {
            role: "user",
            content: "I press forward and kick the helmet toward the goblin to trip it!",
          },
          {
            role: "assistant",
            content: `Clever! The helmet clatters and the goblin stumbles, going down on
            one knee. But it's not out yet - it slashes wildly at your legs with the dagger
            as it falls. The cave passage narrows ahead. Behind you, you hear more goblins
            approaching - their chittering echoes getting louder. The wounded goblin is
            vulnerable now, but you only have seconds before reinforcements arrive.`,
          },
        ],
        seed: 1,
      };

      it("allows finishing off the wounded enemy", async () => {
        const res = await doesThisMakeSense({
          ...combatSequenceContext,
          messages: [
            ...combatSequenceContext.messages,
            {
              role: "user",
              content: "I strike downward at the kneeling goblin with my sword",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows tactical repositioning", async () => {
        const res = await doesThisMakeSense({
          ...combatSequenceContext,
          messages: [
            ...combatSequenceContext.messages,
            {
              role: "user",
              content:
                "I jump over the goblin and run deeper into the narrow passage",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows defensive actions with new threats", async () => {
        const res = await doesThisMakeSense({
          ...combatSequenceContext,
          messages: [
            ...combatSequenceContext.messages,
            {
              role: "user",
              content:
                "I turn to face the approaching goblins, raising my buckler defensively",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows picking up items revealed during combat", async () => {
        const res = await doesThisMakeSense({
          ...combatSequenceContext,
          messages: [
            ...combatSequenceContext.messages,
            {
              role: "user",
              content: "I quickly grab the rusty helmet from the ground",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("rejects healing without items or magic", async () => {
        const res = await doesThisMakeSense({
          ...combatSequenceContext,
          messages: [
            ...combatSequenceContext.messages,
            {
              role: "user",
              content: "I heal myself to full health",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });
    });

    describe("Puzzle Solving Sequence", () => {
      const puzzleContext = {
        messages: [
          {
            role: "system",
            content: "You are a game master for a puzzle-adventure game.",
          },
          {
            role: "assistant",
            content: `You're in a circular stone chamber. In the center is a pedestal with
            three colored crystals: red, blue, and green. Each wall has a matching colored
            rune that glows faintly. There's an inscription: "Ignite them in order of the
            setting sun." The exit door is sealed with magical energy.`,
          },
          {
            role: "user",
            content: "I examine the red rune on the wall closely.",
          },
          {
            role: "assistant",
            content: `The red rune is carved deep into the western wall, glowing with inner
            heat. As you touch it, you feel warmth. Near the base of the wall, you notice
            scorch marks. The rune depicts a flame symbol. Looking at the pedestal from this
            angle, you see the red crystal is pulsing slightly, as if waiting.`,
          },
          {
            role: "user",
            content:
              "I take the red crystal from the pedestal and bring it to the red rune.",
          },
          {
            role: "assistant",
            content: `As you press the red crystal against the red rune, both flare brightly.
            The crystal locks into a small socket you hadn't noticed before. The red rune now
            burns steadily. You hear a soft click - the first of three locks. The blue and
            green crystals remain on the pedestal, and you can now see matching sockets near
            their respective runes. The inscription still reads "in order of the setting sun."`,
          },
        ],
        seed: 1,
      };

      it("allows continuing the puzzle logically", async () => {
        const res = await doesThisMakeSense({
          ...puzzleContext,
          messages: [
            ...puzzleContext.messages,
            {
              role: "user",
              content: "I take the green crystal and bring it to the green rune",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows examining the other runes", async () => {
        const res = await doesThisMakeSense({
          ...puzzleContext,
          messages: [
            ...puzzleContext.messages,
            {
              role: "user",
              content: "I examine the blue rune to see what it depicts",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows re-reading the inscription for clues", async () => {
        const res = await doesThisMakeSense({
          ...puzzleContext,
          messages: [
            ...puzzleContext.messages,
            {
              role: "user",
              content:
                "I read the inscription again, thinking about what 'order of the setting sun' means",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows attempting to remove placed crystal", async () => {
        const res = await doesThisMakeSense({
          ...puzzleContext,
          messages: [
            ...puzzleContext.messages,
            {
              role: "user",
              content: "I try to pull the red crystal back out of its socket",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("rejects placing crystals that were already used", async () => {
        const res = await doesThisMakeSense({
          ...puzzleContext,
          messages: [
            ...puzzleContext.messages,
            {
              role: "user",
              content: "I take the red crystal from the pedestal",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });
    });

    describe("Investigation Sequence with Item Collection", () => {
      const investigationContext = {
        messages: [
          {
            role: "system",
            content: "You are a game master for a detective mystery game.",
          },
          {
            role: "assistant",
            content: `You're investigating the crime scene - a lavish bedroom. The victim's
            body has been removed, but bloodstains mark the carpet near the bed. A shattered
            teacup lies on the floor. The window is open, curtains billowing in the breeze.`,
          },
          {
            role: "user",
            content: "I carefully examine the shattered teacup pieces.",
          },
          {
            role: "assistant",
            content: `The delicate porcelain is scattered across the hardwood. You notice
            a strange bitter smell coming from the liquid residue. Using your handkerchief,
            you carefully collect several pieces - the pattern is distinctive, with gold
            trim and roses. One shard has a lipstick mark. You also spot a small silver
            spoon under the bed that rolled away from the scene.`,
          },
          {
            role: "user",
            content: "I retrieve the silver spoon and add it to my evidence.",
          },
          {
            role: "assistant",
            content: `You carefully pick up the spoon with your handkerchief to preserve
            any fingerprints. It's ornate, with an engraved crest you don't recognize.
            There's a faint residue on the spoon that smells similar to the teacup. Your
            evidence pouch now contains: teacup shards and the silver spoon. You notice
            muddy footprints leading from the window to the door - size 11, men's boots.`,
          },
          {
            role: "user",
            content: "I examine the muddy footprints more closely.",
          },
          {
            role: "assistant",
            content: `The footprints are fresh, the mud still slightly damp. The tread
            pattern suggests military-style boots. They lead from the open window, across
            the room, to the door - then stop. Whoever made them must have removed their
            boots before going further. You notice a small piece of dried clay has fallen
            off one print - reddish clay, unusual for this area. Next to the window, the
            curtain has a small tear, and a thread is caught on the latch.`,
          },
        ],
        seed: 1,
      };

      it("allows collecting the thread evidence", async () => {
        const res = await doesThisMakeSense({
          ...investigationContext,
          messages: [
            ...investigationContext.messages,
            {
              role: "user",
              content: "I carefully remove the thread from the latch and bag it",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows collecting the clay sample", async () => {
        const res = await doesThisMakeSense({
          ...investigationContext,
          messages: [
            ...investigationContext.messages,
            {
              role: "user",
              content:
                "I pick up the piece of reddish clay and add it to my evidence",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows examining the window for more clues", async () => {
        const res = await doesThisMakeSense({
          ...investigationContext,
          messages: [
            ...investigationContext.messages,
            {
              role: "user",
              content: "I check the window sill and frame for fingerprints or marks",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows searching for the removed boots", async () => {
        const res = await doesThisMakeSense({
          ...investigationContext,
          messages: [
            ...investigationContext.messages,
            {
              role: "user",
              content:
                "I search around the doorway for where the boots might have been left",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows photographing or documenting the scene", async () => {
        const res = await doesThisMakeSense({
          ...investigationContext,
          messages: [
            ...investigationContext.messages,
            {
              role: "user",
              content: "I take out my notebook and sketch the footprint pattern",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("rejects referencing evidence never collected", async () => {
        const res = await doesThisMakeSense({
          ...investigationContext,
          messages: [
            ...investigationContext.messages,
            {
              role: "user",
              content: "I compare the thread to the fabric sample I collected earlier",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });
    });

    describe("Extended Trading Sequence", () => {
      const tradingContext = {
        messages: [
          {
            role: "system",
            content: "You are a game master for a merchant trading game.",
          },
          {
            role: "assistant",
            content: `You're at Shen's Exotic Goods in the market district. Shen eyes you
            carefully. "Looking to trade?" he asks. His stall displays silk scarves (30 gold),
            spices from the south (15 gold per pouch), and jade figurines (50 gold). You have
            80 gold and a fine steel dagger worth about 25 gold.`,
          },
          {
            role: "user",
            content: "I ask Shen if he's interested in buying my steel dagger.",
          },
          {
            role: "assistant",
            content: `Shen picks up the dagger, testing its balance and examining the blade.
            "Good craftsmanship. I'll give you 20 gold for it." He sets it on the counter
            between you, waiting for your response. Behind him, you notice he has a locked
            chest and a ledger book. Another customer browses the silk scarves nearby.`,
          },
          {
            role: "user",
            content: "I counter-offer, asking for 23 gold for the dagger.",
          },
          {
            role: "assistant",
            content: `Shen strokes his beard thoughtfully. "You drive a hard bargain. Fine,
            22 gold, and I'll throw in a small pouch of pepper spice." He places 22 gold
            coins on the counter along with a small cloth pouch. "Deal?" The dagger still
            lies on the counter. Your current gold: 80. If you accept, you'll have 102 gold
            and a pepper pouch.`,
          },
        ],
        seed: 1,
      };

      it("allows accepting the deal", async () => {
        const res = await doesThisMakeSense({
          ...tradingContext,
          messages: [
            ...tradingContext.messages,
            {
              role: "user",
              content: "I agree to the deal and take the gold and pepper",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows continuing to negotiate", async () => {
        const res = await doesThisMakeSense({
          ...tradingContext,
          messages: [
            ...tradingContext.messages,
            {
              role: "user",
              content: "I push for 23 gold, saying the dagger is barely used",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows taking back the dagger", async () => {
        const res = await doesThisMakeSense({
          ...tradingContext,
          messages: [
            ...tradingContext.messages,
            {
              role: "user",
              content: "I shake my head and pick up my dagger, 'No deal'",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("allows browsing other items", async () => {
        const res = await doesThisMakeSense({
          ...tradingContext,
          messages: [
            ...tradingContext.messages,
            {
              role: "user",
              content: "I examine the jade figurines while considering the offer",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(true);
      });

      it("rejects claiming wrong gold amount", async () => {
        const res = await doesThisMakeSense({
          ...tradingContext,
          messages: [
            ...tradingContext.messages,
            {
              role: "user",
              content: "I accept and take the 25 gold he offered",
            },
          ],
        });
        expect(res.makesSense, res.reasoning).toBe(false);
      });
    });
  });
});
