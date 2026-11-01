/**
 * Crystal Wisdom pages — content taken from the Empavai PDF.
 * Edit freely, or manage everything later from Admin → Crystal Wisdom.
 *
 * page → sections[] → items[]
 *   section.type : text | cards | list | quote | notice
 *   item         : title, subtitle, tagline, description, chipsLabel, chips[],
 *                  details[{label,value}], note, icon, color
 */
module.exports = [
  {
    "title": "Crystal Wisdom",
    "slug": "crystal-wisdom",
    "eyebrow": "Crystal Wisdom",
    "intro": "Formed by nature. Shaped by time.",
    "menuLabel": "Crystal Wisdom",
    "menuSubtitle": "Formed by nature. Shaped by time.",
    "showInMenu": false,
    "order": 0,
    "metaTitle": "Crystal Wisdom | Empavai",
    "metaDescription": "Crystals are formed by nature and shaped by time. Explore their natural wonder and the personal meaning they may hold.",
    "sections": [
      {
        "type": "text",
        "body": "Crystals are naturally occurring solids whose atoms are arranged in an ordered structure, and their distinctive colours, patterns and inclusions develop through the minerals, heat, pressure and other geological conditions present during their formation. As they grow slowly within the earth over time, natural variations in colour, shape, texture and inclusions emerge, making each crystal unique.\n\nBeyond their natural beauty, crystals have carried cultural and symbolic meaning for centuries. Across different traditions, they have been associated with protection, clarity, love, courage and spiritual reflection.\n\nAt Empavai, we celebrate both dimensions—the natural wonder of the mineral and the personal meaning it may hold.\n\nWhether placed in your space or worn as an adornment, crystals can serve as gentle reminders—to pause, reconnect and live with intention."
      },
      {
        "type": "quote",
        "lines": [
          "Created by the Earth.",
          "Chosen by you.",
          "Made meaningful through intention."
        ]
      }
    ]
  },
  {
    "title": "Chakra Connection",
    "slug": "chakra-connection",
    "eyebrow": "Chakra Connection",
    "intro": "The familiar seven-chakra system represents a symbolic pathway from grounding and self-awareness to expression, insight and spiritual connection.",
    "menuLabel": "Chakra Connection",
    "menuSubtitle": "Seven energy centres",
    "showInMenu": true,
    "order": 1,
    "metaTitle": "Chakra Connection | Empavai",
    "metaDescription": "The familiar seven-chakra system represents a symbolic pathway from grounding and self-awareness to expression, insight and spiritual connection.",
    "sections": [
      {
        "type": "list",
        "heading": "Seven energy centres. Seven paths to balance",
        "items": [
          {
            "title": "ROOT — MULADHARA",
            "tagline": "Ground • Protect • Belong",
            "description": "Symbolically connected with stability, security and our relationship with the Earth.",
            "chipsLabel": "Commonly associated crystals",
            "chips": [
              "Black Tourmaline",
              "Red Jasper",
              "Smoky Quartz",
              "Hematite"
            ],
            "color": "#c0392b"
          },
          {
            "title": "SACRAL — SVADHISTHANA",
            "tagline": "Flow • Create • Feel",
            "description": "Symbolically connected with creativity, enjoyment and emotional expression.",
            "chipsLabel": "Commonly associated crystals",
            "chips": [
              "Carnelian",
              "Orange Calcite",
              "Sunstone",
              "Moonstone"
            ],
            "color": "#e67e22"
          },
          {
            "title": "SOLAR PLEXUS — MANIPURA",
            "tagline": "Shine • Empower • Act",
            "description": "Symbolically connected with confidence, determination and personal purpose.",
            "chipsLabel": "Commonly associated crystals",
            "chips": [
              "Citrine",
              "Tiger’s Eye",
              "Pyrite",
              "Yellow Jasper"
            ],
            "color": "#f1c40f"
          },
          {
            "title": "HEART — ANAHATA",
            "tagline": "Love • Accept • Open",
            "description": "Symbolically connected with compassion, emotional openness and meaningful relationships.",
            "chipsLabel": "Commonly associated crystals",
            "chips": [
              "Rose Quartz",
              "Green Aventurine",
              "Rhodonite",
              "Jade"
            ],
            "color": "#27ae60"
          },
          {
            "title": "THROAT — VISHUDDHA",
            "tagline": "Speak • Express • Reveal",
            "description": "Symbolically connected with communication, honesty and self-expression.",
            "chipsLabel": "Commonly associated crystals",
            "chips": [
              "Aquamarine",
              "Lapis Lazuli",
              "Sodalite",
              "Blue Lace Agate"
            ],
            "color": "#3498db"
          },
          {
            "title": "THIRD EYE — AJNA",
            "tagline": "See • Reflect • Awaken",
            "description": "Symbolically connected with intuition, imagination and inner awareness.",
            "chipsLabel": "Commonly associated crystals",
            "chips": [
              "Amethyst",
              "Labradorite",
              "Fluorite",
              "Iolite"
            ],
            "color": "#4b3b9a"
          },
          {
            "title": "CROWN — SAHASRARA",
            "tagline": "Connect • Expand • Transcend",
            "description": "Symbolically connected with contemplation, higher awareness and spiritual connection.",
            "chipsLabel": "Commonly associated crystals",
            "chips": [
              "Clear Quartz",
              "Selenite",
              "Amethyst",
              "Howlite"
            ],
            "color": "#9b59b6"
          }
        ]
      }
    ]
  },
  {
    "title": "Zodiac & Crystal Alignment",
    "slug": "zodiac-alignment",
    "eyebrow": "Zodiac Alignment",
    "intro": "Inspired by the stars. Grounded in personal intention.",
    "menuLabel": "Zodiac Alignment",
    "menuSubtitle": "Crystals by your sign",
    "showInMenu": true,
    "order": 2,
    "metaTitle": "Zodiac & Crystal Alignment | Empavai",
    "metaDescription": "Astrology has long connected zodiac signs with symbolic qualities, elements and planetary influences. Modern crystal traditions extend these associations to gemstones.",
    "sections": [
      {
        "type": "text",
        "body": "Astrology has long connected zodiac signs with symbolic qualities, elements and planetary influences. Modern crystal traditions extend these associations to gemstones.\n\nThe following is Empavai’s curated guide, based on widely recognised symbolic correspondences. Choose by your sign—or simply choose the crystal that speaks to you."
      },
      {
        "type": "cards",
        "heading": "Find your sign",
        "items": [
          {
            "title": "ARIES",
            "subtitle": "March 21–April 19",
            "chips": [
              "Carnelian",
              "Red Jasper",
              "Clear Quartz"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Courage, momentum and confident beginnings."
              }
            ]
          },
          {
            "title": "TAURUS",
            "subtitle": "April 20–May 20",
            "chips": [
              "Rose Quartz",
              "Emerald",
              "Rhodonite"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Love, stability and emotional grounding."
              }
            ]
          },
          {
            "title": "GEMINI",
            "subtitle": "May 21–June 20",
            "chips": [
              "Citrine",
              "Tiger’s Eye",
              "Blue Lace Agate"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Communication, adaptability and clear thinking."
              }
            ]
          },
          {
            "title": "CANCER",
            "subtitle": "June 21–July 22",
            "chips": [
              "Moonstone",
              "Selenite",
              "Aquamarine"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Intuition, sensitivity and gentle reflection."
              }
            ]
          },
          {
            "title": "LEO",
            "subtitle": "July 23–August 22",
            "chips": [
              "Sunstone",
              "Tiger’s Eye",
              "Pyrite"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Confidence, creativity and radiant expression."
              }
            ]
          },
          {
            "title": "VIRGO",
            "subtitle": "August 23–September 22",
            "chips": [
              "Amazonite",
              "Moss Agate",
              "Peridot"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Focus, balance and connection with nature."
              }
            ]
          },
          {
            "title": "LIBRA",
            "subtitle": "September 23–October 22",
            "chips": [
              "Lapis Lazuli",
              "Rose Quartz",
              "Lepidolite"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Harmony, thoughtful expression and inner balance."
              }
            ]
          },
          {
            "title": "SCORPIO",
            "subtitle": "October 23–November 21",
            "chips": [
              "Obsidian",
              "Malachite",
              "Labradorite"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Transformation, reflection and personal strength."
              }
            ]
          },
          {
            "title": "SAGITTARIUS",
            "subtitle": "November 22–December 21",
            "chips": [
              "Amethyst",
              "Sodalite",
              "Turquoise"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Wisdom, exploration and truth."
              }
            ]
          },
          {
            "title": "CAPRICORN",
            "subtitle": "December 22–January 19",
            "chips": [
              "Garnet",
              "Smoky Quartz",
              "Black Tourmaline"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Determination, grounding and purposeful ambition."
              }
            ]
          },
          {
            "title": "AQUARIUS",
            "subtitle": "January 20–February 18",
            "chips": [
              "Amethyst",
              "Fluorite",
              "Hematite"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Originality, insight and clear ideas."
              }
            ]
          },
          {
            "title": "PISCES",
            "subtitle": "February 19–March 20",
            "chips": [
              "Aquamarine",
              "Amethyst",
              "Lepidolite"
            ],
            "details": [
              {
                "label": "Symbolic intention",
                "value": "Imagination, intuition and emotional calm."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "title": "Placement with Purpose",
    "slug": "sacred-spaces",
    "eyebrow": "Sacred Spaces",
    "intro": "Where a crystal rests can become part of its meaning.",
    "menuLabel": "Sacred Spaces",
    "menuSubtitle": "Placement with purpose",
    "showInMenu": true,
    "order": 3,
    "metaTitle": "Sacred Spaces | Empavai",
    "metaDescription": "Where a crystal rests can become part of its meaning.",
    "sections": [
      {
        "type": "cards",
        "heading": "Where a crystal rests",
        "items": [
          {
            "title": "Entrance",
            "icon": "🚪",
            "description": "For grounding and a welcoming sense of protection."
          },
          {
            "title": "Living Space",
            "icon": "🛋️",
            "description": "For harmony, warmth and balanced surroundings."
          },
          {
            "title": "Bedroom",
            "icon": "🌙",
            "description": "For rest, emotional comfort and gentle energy."
          },
          {
            "title": "Workspace",
            "icon": "✦",
            "description": "For focus, creativity and purposeful action."
          },
          {
            "title": "Meditation Space",
            "icon": "🧘",
            "description": "For stillness, awareness and spiritual connection."
          },
          {
            "title": "Terralume Tray",
            "icon": "🪨",
            "description": "A beautiful resting place for bracelets, jewellery and personal crystals."
          }
        ]
      },
      {
        "type": "text",
        "eyebrow": "Choosing",
        "heading": "How to choose your crystal",
        "body": "Choose by intention, connection, zodiac or chakra. Choose the crystal that catches your eye, reflects your intention or feels personally meaningful. There is no perfect choice—let your connection guide you."
      }
    ]
  },
  {
    "title": "Care, Cleanse & Reconnect",
    "slug": "care-cleanse",
    "eyebrow": "Care & Cleanse",
    "intro": "Physical care and symbolic cleansing are different practices.",
    "menuLabel": "Care & Cleanse",
    "menuSubtitle": "Care, cleanse & reconnect",
    "showInMenu": true,
    "order": 4,
    "metaTitle": "Care & Cleanse | Empavai",
    "metaDescription": "How to physically care for and symbolically cleanse your crystals.",
    "sections": [
      {
        "type": "cards",
        "items": [
          {
            "title": "Physical care",
            "icon": "🧽",
            "description": "For physical care, use a soft, dry cloth or soft brush to remove dust. Some gemstones tolerate gentle washing, while others—including selenite—should be kept dry. Avoid harsh chemicals, intense sunlight, excessive heat and sudden temperature changes. Store jewellery separately to prevent scratching and damage."
          },
          {
            "title": "Symbolic cleansing",
            "icon": "🌙",
            "description": "For symbolic cleansing, crystals may be refreshed through moonlight, smoke cleansing, sound or placement near selenite."
          },
          {
            "title": "Terralume trays",
            "icon": "🪨",
            "description": "Use Terralume trays as a beautiful, intentional resting place for bracelets and accessories."
          }
        ]
      },
      {
        "type": "notice",
        "heading": "A Gentle Reminder",
        "body": "Crystals are objects of natural beauty, cultural meaning and personal intention. They are not medical treatments and should never replace professional healthcare. Their beauty lies in what they represent—an intention held, a moment remembered and a connection with the natural world.",
        "lines": [
          "Nature creates the crystal.",
          "Art gives it form.",
          "You give it meaning."
        ]
      }
    ]
  },
  {
    "title": "The Empavai Crystal Guide",
    "slug": "crystal-guide",
    "eyebrow": "Crystal Guide",
    "intro": "Every crystal has a natural identity and a symbolic story. The descriptions below refer to traditional and contemporary associations. They are intended to help you select a crystal by meaning, colour and personal connection.",
    "menuLabel": "Crystal Guide",
    "menuSubtitle": "Natural identity & symbolism",
    "showInMenu": false,
    "order": 5,
    "metaTitle": "The Empavai Crystal Guide | Empavai",
    "metaDescription": "Every crystal has a natural identity and a symbolic story. The descriptions below refer to traditional and contemporary associations. They are intended to help you select a crystal by meaning, colour and personal connection.",
    "sections": [
      {
        "type": "cards",
        "heading": "Every crystal has a natural identity and a symbolic story",
        "items": [
          {
            "title": "Amethyst",
            "details": [
              {
                "label": "Natural identity",
                "value": "A purple variety of quartz."
              },
              {
                "label": "Traditional symbolism",
                "value": "Calm, reflection and intuition."
              },
              {
                "label": "Beautiful for",
                "value": "Meditation spaces, bedrooms and meaningful adornments."
              }
            ],
            "note": ""
          },
          {
            "title": "Aquamarine",
            "details": [
              {
                "label": "Natural identity",
                "value": "A blue-to-green variety of the mineral beryl."
              },
              {
                "label": "Traditional symbolism",
                "value": "Serenity, courage and communication."
              },
              {
                "label": "Beautiful for",
                "value": "Everyday jewellery and quiet, calming spaces."
              }
            ],
            "note": ""
          },
          {
            "title": "Black Tourmaline",
            "details": [
              {
                "label": "Natural identity",
                "value": "A dark variety from the tourmaline mineral group."
              },
              {
                "label": "Traditional symbolism",
                "value": "Grounding, boundaries and protection."
              },
              {
                "label": "Beautiful for",
                "value": "Entrances, workspaces and everyday bracelets."
              }
            ],
            "note": ""
          },
          {
            "title": "Carnelian",
            "details": [
              {
                "label": "Natural identity",
                "value": "An orange-to-red variety of chalcedony."
              },
              {
                "label": "Traditional symbolism",
                "value": "Creativity, confidence and motivation."
              },
              {
                "label": "Beautiful for",
                "value": "Studios, creative spaces and new beginnings."
              }
            ],
            "note": ""
          },
          {
            "title": "Citrine",
            "details": [
              {
                "label": "Natural identity",
                "value": "A yellow-to-orange variety of quartz."
              },
              {
                "label": "Traditional symbolism",
                "value": "Optimism, prosperity and personal power."
              },
              {
                "label": "Beautiful for",
                "value": "Workspaces, business areas and uplifting décor."
              }
            ],
            "note": ""
          },
          {
            "title": "Clear Quartz",
            "details": [
              {
                "label": "Natural identity",
                "value": "A colourless variety of crystalline quartz."
              },
              {
                "label": "Traditional symbolism",
                "value": "Clarity, focus and intention."
              },
              {
                "label": "Beautiful for",
                "value": "Crystal trees, meditation areas and display arrangements."
              }
            ],
            "note": ""
          },
          {
            "title": "Fluorite",
            "details": [
              {
                "label": "Natural identity",
                "value": "A colourful mineral valued for its range of hues and fluorescence."
              },
              {
                "label": "Traditional symbolism",
                "value": "Organisation, concentration and clear thinking."
              },
              {
                "label": "Beautiful for",
                "value": "Desks, study areas and creative workspaces."
              }
            ],
            "note": ""
          },
          {
            "title": "Green Aventurine",
            "details": [
              {
                "label": "Natural identity",
                "value": "Quartz containing mineral inclusions that create a subtle shimmering appearance."
              },
              {
                "label": "Traditional symbolism",
                "value": "Opportunity, optimism and renewal."
              },
              {
                "label": "Beautiful for",
                "value": "Living spaces, work areas and meaningful gifts."
              }
            ],
            "note": ""
          },
          {
            "title": "Labradorite",
            "details": [
              {
                "label": "Natural identity",
                "value": "A feldspar known for flashes of blue, green and gold called labradorescence."
              },
              {
                "label": "Traditional symbolism",
                "value": "Transformation, intuition and self-discovery."
              },
              {
                "label": "Beautiful for",
                "value": "Personal adornments and reflective spaces."
              }
            ],
            "note": ""
          },
          {
            "title": "Lapis Lazuli",
            "details": [
              {
                "label": "Natural identity",
                "value": "A blue rock composed mainly of lazurite, often with calcite and pyrite."
              },
              {
                "label": "Traditional symbolism",
                "value": "Wisdom, truth and expression."
              },
              {
                "label": "Beautiful for",
                "value": "Jewellery, artistic objects and communication spaces."
              }
            ],
            "note": ""
          },
          {
            "title": "Moonstone",
            "details": [
              {
                "label": "Natural identity",
                "value": "A feldspar admired for its floating, moonlike sheen."
              },
              {
                "label": "Traditional symbolism",
                "value": "New beginnings, intuition and emotional awareness."
              },
              {
                "label": "Beautiful for",
                "value": "Jewellery, bedrooms and personal spaces."
              }
            ],
            "note": ""
          },
          {
            "title": "Pyrite",
            "details": [
              {
                "label": "Natural identity",
                "value": "An iron sulphide mineral recognised by its metallic, golden appearance."
              },
              {
                "label": "Traditional symbolism",
                "value": "Confidence, determination and abundance."
              },
              {
                "label": "Beautiful for",
                "value": "Offices, display areas and bold decorative details."
              }
            ],
            "note": "Keep pyrite dry and away from prolonged humidity."
          },
          {
            "title": "Rose Quartz",
            "details": [
              {
                "label": "Natural identity",
                "value": "A pale-pink variety of quartz."
              },
              {
                "label": "Traditional symbolism",
                "value": "Love, compassion and emotional warmth."
              },
              {
                "label": "Beautiful for",
                "value": "Bedrooms, living spaces and heartfelt gifts."
              }
            ],
            "note": ""
          },
          {
            "title": "Selenite",
            "details": [
              {
                "label": "Natural identity",
                "value": "A transparent or translucent crystalline variety of gypsum."
              },
              {
                "label": "Traditional symbolism",
                "value": "Clarity, stillness and purification."
              },
              {
                "label": "Beautiful for",
                "value": "Meditation spaces, displays and Terralume trays."
              }
            ],
            "note": "Selenite is soft and moisture-sensitive. Keep it dry and handle it carefully."
          },
          {
            "title": "Smoky Quartz",
            "details": [
              {
                "label": "Natural identity",
                "value": "A naturally brown-to-grey variety of quartz."
              },
              {
                "label": "Traditional symbolism",
                "value": "Grounding, resilience and release."
              },
              {
                "label": "Beautiful for",
                "value": "Entrances, workspaces and contemplative areas."
              }
            ],
            "note": ""
          },
          {
            "title": "Tiger’s Eye",
            "details": [
              {
                "label": "Natural identity",
                "value": "A quartz gemstone known for its silky bands of reflected light."
              },
              {
                "label": "Traditional symbolism",
                "value": "Courage, confidence and discernment."
              },
              {
                "label": "Beautiful for",
                "value": "Bracelets, workspaces and statement pieces."
              }
            ],
            "note": ""
          },
          {
            "title": "Multi-Crystal",
            "details": [
              {
                "label": "Natural identity",
                "value": "A harmonious combination of several crystals."
              },
              {
                "label": "Traditional symbolism",
                "value": "Balance, unity, abundance and the harmonious connection of different intentions. Each crystal contributes its own symbolic meaning—together they represent grounding, love, clarity, confidence, creativity and spiritual reflection."
              },
              {
                "label": "Beautiful for",
                "value": "Living spaces, entrances, workspaces, meditation corners and meaningful gifts."
              }
            ],
            "note": ""
          }
        ]
      }
    ]
  }
];
