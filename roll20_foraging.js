// By:       HT
//Create this macro: !herbs ?{Choose a Terrain|common|arctic|coastal|desert|forest|grasslands|hills|mountain|swamp|underdark|vulcanic}
var foraging = foraging || (function() {
    'use strict';

   var version = 0.10,
        helpMsg = "/Usage: [!foraging|!herbs] [--help|-h] [--private|-w] [terrain], or simply create this macro !herbs ?{Choose a Terrain|common|arctic|coastal|desert|forest|grasslands|hills|mountain|swamp|underdark|vulcanic}",
        tableName = "foraging Table",
        msgFormat ="/w gm &{template:default} {{name=foraging (!percentFind / !percentuale)}} {{Terreno=!terrain}} {{Nome=!ingredient (!Kit)}}{{Quantità=[[!amount]] !form}} {{Foraggiare=DC !Foraging}}{{Craft/Alchimia=DC !Crafting}} {{Descrizione=!descriptions}}{{Utilizzo=!Effect}} {{Workload=!Workload}}",
        // rules state chance of special roll is 75-100 on a d100 if 2d6 comes up 2,3,4,10,11,12. This is roughly a 1-9 on a d100 overall chance.
        // chanceOfSpecial = 9,
        // change to false if you don't want to auto-roll common ingredients
        autoRollIfCommon = false,
        // change to true if you want to auto-reroll bloodgrass
        autoReRerollIfBloodgrass = false,
        // Table Entries
        // common ingredients
        commonTable = [
			{range: [2,3],  ingredient: "Bloodgrass",           amount: "1d10", form: "herbs",      Foraging: "10", Crafting: "10" , Kit:"requires foraging kit",  Effect: "One dose can become a food source for 1 day.", Workload: "Worktime: 1 days (x10 doses). Additional Cost 1 gp", descriptions:"The most boring, common plant life found in the wild is this dark brown grass. It has absolutely no remarkable qualities, other than being relatively harmless, and its use as basic sustenance when properly prepared. Herbalists do not find this grass very unique, but still tend to collect it as it occupies almost no space in their packs.", additionalRules: "Find 2x the rolled amount"},
			{range: [4],    ingredient: "Cat's Tongue",         amount: "1d10", form: "herbs",      Foraging: "10", Crafting: "15" , Kit:"requires foraging kit",  Effect: "Tea of Refreshment",                           Workload: "Worktime: 1 days. Additional Cost 25 gp",            descriptions:"Green Herb"},
			{range: [5,6],  ingredient: "Frostlich",            amount: "1d10", form: "leaves",     Foraging: "10", Crafting: "10" , Kit:"requires foraging kit",  Effect: "Tobacco",                                      Workload: "Worktime: 1 days. Additional Cost 10 gp",            descriptions:"A pipeweed known for its inferior quality"},
    		{range: [7],    ingredient: "Hoga's Cherry",        amount: "1d6",  form: "berry",      Foraging: "15", Crafting: "10" , Kit:"requires poisoner's kit", Effect: "Basic Poison (Injury)",                        Workload: "Worktime: 1 days. Additional Cost 25 gp",            descriptions:"A shrub with small, green flowers and an orange-red fruit which can be toxic"},
			{range: [8],    ingredient: "Quicksilver Lichen",   amount: "1d4",  form: "lichen",     Foraging: "15", Crafting: "--" , Kit:"requires poisoner's kit", Effect: "Toxin Modifier. Double the dice rolled of any Toxin Effect, but reduce that Effect duration by half. This modifier can stack.", Workload: "No worktime or additional cost", descriptions:"This silver and grey silky moss can be found growing amongst almost any substance as it seems toignore environmental standards. Assassins have been able to use this lichen to quickly administer their toxins into the target’s system without any drawbacks. However, this takes some preparation and is often forgotten by common folk."},
			{range: [9],    ingredient: "Veinrot",              amount: "1",    form: "flowers",    Foraging: "25", Crafting: "25" , Kit:"requires poisoner's kit", Effect: "Veinrot Poison (Ingested or Injury)",          Workload: "Worktime: 30 days. Additional Cost 1000 gp",         descriptions:"Veinrot poison is extracted from the seeds of a dark flower with same name that grows from rotting organic matter."},
			{range: [10],   ingredient: "Wyrmtongue Petals",    amount: "1d4",  form: "flowers",    Foraging: "14", Crafting: "18" , Kit:"requires poisoner's kit", Effect: "Widow Venom (Contact)",                        Workload: "Worktime: 1 days. Additional Cost 25 gp",            descriptions:"assassins, and many Drows, favorite natural ingredient. These jagged red petals can be found growing on Wyrmtongue flowers in almost every terrain. It’s almost as if the world itself is trying to test humanity by letting these flowers grow everywhere. These petals are used as a base for toxins that can offer extremely powerful damage. For this reason, Wyrmtongue is highly illegal, and in many cases punishes owners of this flower with deat"},
			{range: [11,12],ingredient: "Young Merry",          amount: "1d6",  form: "leaves",     Foraging: "13", Crafting: "13" , Kit:"requires foraging kit",  Effect: "Quality Tobacco",                              Workload: "Worktime: 1 days. Additional Cost 10 gp",            descriptions:"A well-known variety of pipeweed "}
        ],
        // arctic ingredients
        arcticTable = [
			{range: [2],    ingredient: "Aeglos",           amount: "1d4",  form: "roots",      Foraging: "18", Crafting: "20" , Kit:"requires foraging kit",      Effect: "When a creature drinks the infusion, at the beginning of their next turn they gain a +1 bonus to Armor Class if they are wearing no armor or light armor, which lasts for 10 rounds. This herb has no effect when used again on the creature until the creature completes a short rest.", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"A tall, thorny plant with white, sweet-smelling flower; the roots are used as a stimulant."},
			{range: [3],    ingredient: "Fiend’s Ivy",      amount: "1d4",  form: "thorns",     Foraging: "20", Crafting: "20" , Kit:"requires alchemist supplies", Effect: "Potion of Mind Reading ", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions: "These long, red thorn-encrusted vines can stretch up to 3 feet long and have sharp thorns that reach up to an inch or two long. It isn’t rare to find blood stains amongst these vines as many animals and adventurers can easily trip or get caught in a bushel of the vines. The vines also seem to have a sentient  quality to them as they relax when prey is near, and contract when captured."},
			{range: [4,5],  ingredient: "Frost Lichen",     amount: "1d6",  form: "bunches",    Foraging: "15", Crafting: "15" , Kit:"requires foraging kit",      Effect: "Potion of Resistance (Cold)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"Blu green lichen"},
			{range: [6],    ingredient: "Frozen Seedlings", amount: "1d4",  form: "peas",       Foraging: "20", Crafting: "15" , Kit:"requires poisoner's kit",     Effect: "Generic Poison (Injury DC 15). While poisoned, target’s movement speed is reduced by 10 ft for 1 minute", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"These small, pea sized pods can be found amongst resilient flowers in very cold environments. Named for their almost frozen appearance, they can be plucked with relative  ease and are often used in cold alcoholic drinks. Some assassins  have found ways to crush these into a paste and hamper one’s movements."},
			{range: [7],    ingredient: "Mortflesh Powder", amount: "1",    form: "bulb",       Foraging: "25", Crafting: "25" , Kit:"requires alchemist supplies", Effect: "Potion of Longevity ", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"This dark purple powder is often found growing on top of moss in dark, cold environments. This powder is often used as makeup for young men and women to reduce the look of age from their faces. When imbibed with a magical catalyst, the effect is said to be permanent when consumed"},
			{range: [8,9],  ingredient: "Silverthorn",      amount: "1d6",  form: "thorns",     Foraging: "20", Crafting: "15" , Kit:"requires foraging kit",      Effect: "Oil of Sharpness", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This thorny vine is a pale silver color, and is hard as metal.  Patches of silverthorn create difficult terrain, and deal 1d6 piercing damage if moved through at normal speed."},
			{range: [10],   ingredient: "Veinrot",          amount: "1",    form: "flowers",    Foraging: "25", Crafting: "25" , Kit:"requires poisoner's kit",     Effect: "Veinrot Poison (Injury or Ingested)", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions: "Veinrot poison is extracted from the seeds of a dark flower with same name that grows from rotting organic matter."},
			{range: [11],   ingredient: "Voidroot",         amount: "1d4",  form: "roots",      Foraging: "25", Crafting: "25" , Kit:"requires alchemist supplies", Effect: "Potion of Flying ", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"This dark grey thick root is often found amongst the most extreme environments. It normally grows in either desert or arctic environments and seems to vary in growth rate per root. Herbalists tend to be very careful when they extract this root from the ground, as it seems to defy gravity and want to “fly” away."}
        ],
        	// underwaterTable ingredients
        underwaterTable = [
			{range: [2],  	ingredient: "Blue Toadshade",   amount: "1d4",	form: "stalks", Foraging: "20", Crafting: "15" , Kit:"requires alchemist supplies", Effect: "Potion of Gaseous Form", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"Blue Toadshade. Another common mushroom is this dark blue cap with a yellow striped stem. When disturbed, this mushroom lets off a puff of blue powder. Usually this causes no permanent harm to the surrounding creatures, but it can stain their skin and equipment for a short while. The powder is commonly used to color various inks and dyes. Herbalists usually search for the fungi around small watering holes, where aquatic life often thrives."},
			{range: [3],    ingredient: "Cosmos Glond",     amount: "1d4", 	form: "leaves", Foraging: "15", Crafting: "20" , Kit:"requires alchemist supplies", Effect: "Potion of Clairvoyance", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"This uncommon four-leafed plant is notorious for being somewhat difficult to find. This is mostly due to the plant growing about 5 feet underneath the ground, and only peeking out during its final maturity. However, it has an uncanny look of the stars in a night sky amongst its leaves."},
			{range: [4],    ingredient: "Devil's Grasp",    amount: "1d4", 	form: "stems", 	Foraging: "20", Crafting: "17" , Kit:"requires poisoner's kit", Effect: "Mother's Mercy Poison (Ingested)", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"This toxin looks like, tastes like, and has the texture of cow's milk. Those affected by the toxin slowly lose all bodily strength until they are left unconscious, eventually dying peacefully and without pain."},
			{range: [5,6],  ingredient: "Gillyweed",      	amount: "2d4", 	form: "leaves", Foraging: "10", Crafting: "10" , Kit:"requires foraging kit", Effect: "Potion of Waterbreathing", Workload: "Worktime: 1 days. Additional Cost 25 gp", descriptions:"This emerald green kelp is found underwater and is always covered in tiny air bubbles, which makes it easy to spot by a trained herbalist."},
			{range: [7,8],  ingredient: "Hydrathistle",     amount: "1", 	form: "flower", Foraging: "15", Crafting: "10" , Kit:"requires alchemist supplies", Effect: "Potion of Water Breathing", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"Named for its appearance, this threepronged blue and black flower is often found in dark and dank environments. When used alone, the thistle has no real beneficial effects. However, skilled alchemists have been able to use highly powerful and natural water to concoct potions that allow them to breath in water."},
			{range: [9],    ingredient: "Lightning Moss",   amount: "1d6", 	form: "clumps", Foraging: "15", Crafting: "15" , Kit:"requires foraging kit", Effect: "Potion of Resistance (Lightning)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This light blue moss grows only where lightning has struck and gives off a faint static electric shock when touched. If rubbed on the bottom of a creature's feet or pair of shoes, the creature's speed increases by 5 feet for 1 hour."},
			{range: [10],   ingredient: "Moonstalker",      amount: "2d4", 	form: "flowers", Foraging: "20", Crafting: "10" , Kit:"requires foraging kit", Effect: "See Description", Workload: "Worktime: 1 days. Additional Cost 25 gp", descriptions:"This pale blue flower grows in pairs and blooms only during the nighttime, and has an ethereal glow. The flower sheds dim light for 5 feet when blooming, and is often mistaken for glowing eyes from a distance."},
			{range: [11],   ingredient: "Veinrot",      	amount: "1", 	form: "flowers", Foraging: "25", Crafting: "25" , Kit:"requires poisoner's kit", Effect: "Veinrot Poison (Injury Or Ingested)", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"Veinrot poison is extracted from the seeds of a dark flower with same name that grows from rotting organic matter."},
			{range: [12],   ingredient: "Wrackwort Bulbs",  amount: "1d4", 	form: "bulbs", 	Foraging: "20", Crafting: "20" , Kit:"requires alchemist supplies", Effect: "Potion of Diminution", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"These huge white bulbs can be found on small yellow mushrooms often found in swamps or wet caverns. The mushroom releases a puff of powder from these bulbs when threatened and it tends to confuse and hinder a person. When harvested successfully, these bulbs can be ground into a paste and imbibed within magical water to diminish the size of a being."}
        ],
       // desert ingredients
        desertTable = [
			{range: [2],    ingredient: "Arrow Root",           amount: "1d6", 	form: "leaves", 	Foraging: "15", Crafting: "10" , 	Kit:"requires foraging kit", 	Effect: "+1 to attack rolls for one minute when applied to a weapon. ", Workload: "Worktime: 1 days. Additional Cost 25 gp", descriptions:"This unusually elongated plant can stand up to four feet tall, and is very easy to spot due to its distinctive white and brown speckled pattern. The Arrow Root thrives in desert and drought environments, as the plant needs very little water to survive. When diced and boiled in water the plant creates a frothy silver liquid, which is ideal for sharpening and polishing weapons and armor without the use of magic or other means."},
			{range: [3],    ingredient: "Ashblossom",           amount: "1d6", 	form: "blossoms", 	Foraging: "20", Crafting: "15, 20" ,Kit:"requires foraging kit", 	Effect: "Potion of Resistance (Fire), Potion of Fire Breathing", Workload: "Worktime: 3 days, 10 fdays. Additional Cost 100 gp, 250 gp", descriptions:"This tiny flower is bright red with a yellow center, and is found growing only in hot environments. It deals 1d4 fire damage when ingested, but it can be used to brew many fire-related potions by a knowledgeable alchemist."},
			{range: [4],    ingredient: "Cactus Juice",         amount: "1", 	form: "liter", 		Foraging: "13", Crafting: "15" , 	Kit:"requires foraging kit", 	Effect: "Water fo the Desert.", Workload: "Worktime: 10 minutes", descriptions:"This usually clear liquid can be found within most cacti around the world. It’s reasonably difficult to extract, as many cacti are dangerous to work with. Brewers love to use this juice in many recipes, as one of its effects is to delay alcohol intoxication, allowing people to purchase and consume more before it hits them."},
			{range: [5],    ingredient: "Lizard Cacti",         amount: "1d4", 	form: "flowers", 	Foraging: "17", Crafting: "13" , 	Kit:"requires poisoner's kit", 	Effect: "Bloodfire Paste Poson (Injury)", Workload: "Worktime: 1 days. Additional Cost 25 gp", descriptions:"This plant is a comon cactus, but its properties are growth thanks to desert lizard that use it like home"},
			{range: [6],    ingredient: "Luissun",              amount: "1d4", 	form: "streams", 	Foraging: "20", Crafting: "15" , 	Kit:"requires foraging kit", 	Effect: "The creature reduces their exhaustion by one level. This herb has no effect when used again on the creature until the creature completes a long rest.", Workload: "No worktime or additional cost", descriptions:"A fragrant flower which are drank in tea to refresh the spirit."},
			{range: [7,8],  ingredient: "Scillia Beans",        amount: "1d10", form: "beans", 		Foraging: "10", Crafting: "15" , 	Kit:"requires foraging kit", 	Effect: "Potion of Climbing ", Workload: "Worktime: 1 days. Additional Cost 25 gp", descriptions:"These light brown beans can occasionally be found hanging from Scillia Bushes in dry atmosphere environments. They are often used to enhance flavors in stew and other meals, but have a much stranger effect. At full potency, some of these beans can offer the user the ability to climb steep cliffs and rock faces with ease."},
			{range: [9],    ingredient: "Spaire",               amount: "1d4", 	form: "leaves", 	Foraging: "15", Crafting: "20" , 	Kit:"requires poisoner's kit", 	Effect: "Red Spire Poison (injury)", Workload: "Worktime: 1 days. Additional Cost 50 gp", descriptions:"A reddish-hued leafy plant"},
			{range: [10],   ingredient: "Spineflower Berries",  amount: "1d4", 	form: "thorns", 	Foraging: "17", Crafting: "18" , 	Kit:"requires poisoner's kit", 	Effect: "Death’s Bite Poison (injury).", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"Often found hanging amongst the bone-like flowers, this white berry can be harvested and crushed to enhance toxins made by scoundrels. However, this effect only applies when introduced directly to the bloodstream. When ingested normally these berries provide little sustenance, but do not harm the person."},
			{range: [11],   ingredient: "Veinrot",              amount: "1", 	form: "flowers", 	Foraging: "25", Crafting: "25" , 	Kit:"requires poisoner's kit", 	Effect: "Veinrot Poison (Injury or Ingested)", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"Veinrot poison is extracted from the seeds of a dark flower with same name that grows from rotting organic matter."},
			{range: [12],   ingredient: "Furfungi",             amount: "1d4", 	form: "stalks", 	Foraging: "25", Crafting: "15" , 	Kit:"requires poisoner's kit", 	Effect: "Dust of the Desert Winds Poison (Inhaled)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"Beneath the desert sands grows a fungus that draws moisture from its surroundings. The spores of this fungus can be gathered and stored for later use as a poison."}
        ],
        // forest ingredients
        forestTable = [
			{range: [2],	ingredient: "Arrow Root",      		amount: "1d6", 	form: "leaves", 		Foraging: "15", Crafting: "10" , Kit:"requires foraging kit", Effect: "+1 to attack rolls for one minute when applied to a weapon.", Workload: "Worktime: 1 days. Additional Cost 25 gp", descriptions:"This unusually elongated plant can stand up to  four feet tall, and is very easy to spot due to its distinctive white and brown speckled pattern. The Arrow Root thrives in desert and drought environments, as the plant needs very little water to survive. When diced and boiled in water the plant creates a frothy silver liquid, which is ideal for sharpening and polishing weapons and armor without the use of magic or other means."},
			{range: [3],	ingredient: "Bloodgrass",      		amount: "1d10", form: "herbs", 			Foraging: "10", Crafting: "10" , Kit:"requires foraging kit", Effect: "One dose can become a food source for 1 day.", Workload: "Worktime: 1 days (x10 doses). Additional Cost 1 gp", descriptions:"The most boring, common plant life found in the wild is this dark brown grass. It has absolutely no remarkable qualities, other than being relatively harmless, and its use as basic sustenance when properly prepared. Herbalists do not find this grass very unique, but still tend to collect it as it occupies almost no space in their packs."},
			{range: [4],	ingredient: "Blue Toadshade",      	amount: "1d4", 	form: "stalks", 		Foraging: "20", Crafting: "15" , Kit:"requires alchemist supplies", Effect: "Potion of Gaseous Form", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"Blue Toadshade. Another common mushroom is this dark blue cap with a yellow striped stem. When disturbed, this mushroom lets off a puff of blue powder. Usually this causes no permanent harm to the surrounding creatures, but it can stain their skin and equipment for a short while. The powder is commonly used to color various inks and dyes. Herbalists usually search for the fungi around small watering holes, where aquatic life often thrives."},
			{range: [5],    ingredient: "Fairy Stool",      	amount: "1d4", 	form: "stalks", 		Foraging: "20", Crafting: "15" , Kit:"requires foraging kit", Effect: "Potion of Truesight", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This small pink mushroom is most often found in fairy rings. Ingesting it causes blindness for 1 minute on a failed Constitution saving throw (DC 20), along with vivid hallucinations."},
			{range: [6],    ingredient: "Hagfinger",      		amount: "1d4", 	form: "dried fingers", 	Foraging: "20", Crafting: "15" , Kit:"requires foraging kit", Effect: "Pomander of Warding", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"These small tubers are a pale, sickly green and resemble long fingers. When dried and ground up into a powder, it gives off a strong aroma and can be used as an foraging and potion ingredient."},
			{range: [7],    ingredient: "Moonstalker",      	amount: "2d4", 	form: "flowers", 		Foraging: "20", Crafting: "10" , Kit:"requires foraging kit", Effect: "See Description", Workload: "Worktime: 1 days. Additional Cost 25 gp", descriptions:"This pale blue flower grows in pairs and blooms only during the nighttime, and has an ethereal glow. The flower sheds dim light for 5 feet when blooming, and is often mistaken for glowing eyes from a distance."},
			{range: [8],    ingredient: "Nightshade",      		amount: "1d6", 	form: "flowers", 		Foraging: "15", Crafting: "20" , Kit:"requires foraging kit", Effect: "Midnight Tears Poison (Ingested)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"It deals 1d4 poison damage when ingested and, on a failed Constitution saving throw, inflicts the poisoned condition for 2d4 hours."},
			{range: [9],    ingredient: "Red Amanita Mushroom", amount: "2d4", 	form: "stalks", 		Foraging: "10", Crafting: "10,15,20,25" , Kit:"requires foraging kit", Effect: "Potion of Healing (1 dose), Potion of Greater Healing (3 doses), Potion of Superior Healing (10 doses), Potion of Supreme Healing (30 doses)", Workload: "Worktime: 1 day, 3 days, 10 days, 30 days. Additional Cost: 25 gp, 100 gp, 500 gp, 1000 gp", descriptions:"This red-capped mushroom can grow to the size of a small dish. It deals 1d4 poison damage when ingested, but can be used to brew healing potions by a careful herbalist."},
			{range: [10],   ingredient: "Rowan Berries",      	amount: "3d6", 	form: "clusters", 		Foraging: "10", Crafting: "5" , Kit:"requires foraging kit", Effect: "Antitoxin", Workload: "Worktime: 1 day, additional Cost: 25 gp", descriptions:"These small clusters of red berries grow on the rowan, a tree highly revered by druids. They are known for their purifying properties."},
			{range: [11],   ingredient: "Uruksbane",      		amount: "1d6", 	form: "stems", 			Foraging: "18", Crafting: "12" , Kit:"requires poisoner's kit", Effect: "Torpor Poison (Ingested)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"Plant with stout stem and dark red stalks with sturdy bristles"},
			{range: [12],   ingredient: "Veinrot",     			amount: "1", 	form: "flowers", 		Foraging: "25", Crafting: "25" , Kit:"requires poisoner's kit", Effect: "Veinrot Poison (Injury or Ingested)", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"Veinrot poison is extracted from the seeds of a dark flower with same name that grows from rotting organic matter."}
        ],
        // grasslands ingredients
        grasslandsTable = [
			{range: [2], 	ingredient: "Arrow Root",      	amount: "1d6", 	form: "leaves", 	Foraging: "15", Crafting: "10" , Kit:"requires foraging kit", Effect: "+1 to attack rolls for one minute when applied to a weapon. ", Workload: "Worktime: 1 days. Additional Cost 25 gp", descriptions:"This unusually elongated plant can stand up to four feet tall, and is very easy to spot due to its distinctive white and brown speckled pattern. The Arrow Root thrives in desert and drought environments, as the plant needs very little water to survive. When diced and boiled in water the plant creates a frothy silver liquid, which is ideal for sharpening and polishing weapons and armor without the use of magic or other means."},
			{range: [3,4],  ingredient: "Bloodgrass",      	amount: "1d10", form: "herbs", 		Foraging: "10", Crafting: "10" , Kit:"requires foraging kit", Effect: "One dose can become a food source for 1 day.", Workload: "Worktime: 1 days (x10 doses). Additional Cost 1 gp", descriptions:"The most boring, common plant life found in the wild is this dark brown grass. It has absolutely no remarkable qualities, other than being relatively harmless, and its use as basic sustenance when properly prepared. Herbalists do not find this grass very unique, but still tend to collect it as it occupies almost no space in their packs."},
			{range: [5],    ingredient: "Eglantine",      	amount: "1d4", 	form: "thorns", 	Foraging: "18", Crafting: "15" , Kit:"requires foraging kit", Effect: "After ingesting this infusion, at the beginning of the creature's next turn they gain a +1 bonus to initiative and a -1 penalty to all Intelligence.  checks which lasts for 30 minutes. This herb has no effect when used again on the creature until the creature completes a short rest. ", Workload: "Worktime: 1 days. Additional Cost 50 gp", descriptions:"violet and pink wild rose"},
			{range: [6],    ingredient: "Fumellar",      	amount: "1d4", 	form: "leaves", 	Foraging: "14", Crafting: "15" , Kit:"requires foraging kit", Effect: "After ingesting the oil, at the beginning of the creature's next turn they regain 10 (2d10) hit points, and must make a DC 10 Constitution check. On a failed save, the creature falls unconscious for 2 (1d4) minutes. This herb has no effect when used again on the creature until the creature completes a short rest.", Workload: "No worktime or additional cost", descriptions:"A red flower known as the flowers of sleep."},
			{range: [7,8], 	ingredient: "Rowan Berries",    amount: "3d6", 	form: "clusters", 	Foraging: "10", Crafting: "5" ,  Kit:"requires foraging kit", Effect: "Antitoxin", Workload: "Worktime: 1 day, additional Cost: 25 gp", descriptions:"These small clusters of red berries grow on the rowan, a tree highly revered by druids. They are known for their purifying properties."},
			{range: [9],    ingredient: "Sourgrass",      	amount: "2d4", 	form: "clumps", 	Foraging: "15", Crafting: "5" ,  Kit:"requires poisoner's kit", Effect: "Soothing Salve Poison (Ingested)", Workload: "Worktime: 1 day, additional Cost: 25 gp", descriptions:"This green, long-bladed grass has a pungent smell and flavor. Humanoids who come within 5 feet of uncut sourgrass must make a successful Constitution saving throw (DC 10) or become overwhelmed with nausea and inflicted with the poisoned condition for 30 seconds."},
			{range: [10],   ingredient: "Tail Leaf",      	amount: "1d8", 	form: "leafs", 		Foraging: "25", Crafting: "20" , Kit:"requires alchemist supplies", Effect: "Potion of Speed", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"This very fuzzy, dark green leaf looks like a circle with three thick strands hanging from it. When held, the leaf itself feels as though it is vibrating. It is known that a skilled Herbalist can use these leaves in concoctions to create powerful magical effects to enhance one’s speed."},
			{range: [11],   ingredient: "Veinrot",      	amount: "1", 	form: "flowers", 	Foraging: "25", Crafting: "25" , Kit:"requires poisoner's kit", Effect: "Veinrot Poison (Injury or Ingested)", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"Veinrot poison is extracted from the seeds of a dark flower with same name that grows from rotting organic matter."},
			{range: [12],   ingredient: "Verdant Nettle",   amount: "1d6", 	form: "roots", 		Foraging: "15", Crafting: "10" , Kit:"requires foraging kit", Effect: "Potion of Animal Friendship ", Workload: "Worktime: 1 days. Additional Cost 25 gp", descriptions:"With its dark green and yellow speckled mesh, this plant can be easily spotted. It normally grows in forests and can catch a person’s feet when traveling if they do not have proper footing. Alchemists like to use this plant to create tonics that enhance one’s strength and reflexes."}
        ],
        // hill ingredients
        hillsTable = [
			{range: [2],    ingredient: "Devil's Bloodleaf",    amount: "1", 	form: "flower", 	Foraging: "25", Crafting: "20" , Kit:"requires alchemist supplies", Effect: "Potion of Vitality", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"Only a few recorded instances of this red and yellow flower exist. This large and bold red leaf can be going back in history to the dawn of humankind. It was once a popular decoration around homes and gardens, but has become one of the rarest plants in the world. It is said to give immense vitality and health to one who can properly prepare the plant."},
			{range: [3],    ingredient: "Devil's Grasp",      	amount: "1d4", 	form: "stems", 		Foraging: "20", Crafting: "17" , Kit:"requires poisoner's kit", Effect: "Mother's Mercy Poison (Ingested)", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"This toxin looks like, tastes like, and has the texture of cow's milk. Those affected by the toxin slowly lose all bodily strength until they are left unconscious, eventually dying peacefully and without pain."},
			{range: [4,5],  ingredient: "Harrada Leaf",      	amount: "1d6", 	form: "leafs", 		Foraging: "10", Crafting: "15" , Kit:"requires poisoner's kit", Effect: "Harrada Poison (DC 15 Injury). While poisoned, target has disadvantage on ability checks for 1 minute.", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This huge yellow leaf can often be found near tree tops in lush environments. It is often cultivated and harvested by gangs or the Thieves Guilds to be sold as a street drug. The potent nature of this addictive substance will cause a brief euphoric state coupled with an increase in a specific attribute; followed by a long recovery period in which the user is extremely weakened in that attribute."},
			{range: [6,7],  ingredient: "Ironwood Heart",      	amount: "1d6", 	form: "seeds", 		Foraging: "15", Crafting: "10" , Kit:"requires alchemist supplies", Effect: "Potion of Growth", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This gnarled white seed is commonly found in the nooks of Ironwood Trees. These large seeds pulse with a slow repetitive beat when gripped tightly, often referred to as “Nature’s Heartbeat”. It is said that when cooked or properly prepared by a Herbalist these seeds can increase a beings physical size greatly."},
			{range: [8,9],  ingredient: "Nightshade Berries",	amount: "1d6", 	form: "berries", 	Foraging: "15", Crafting: "20" , Kit:"requires foraging kit", Effect: "Oil of Slipperiness", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"These light blue berries can be found in small clumped packs among small bushes in lush environments. They can be safely ingested and are often eaten by wild animals for their sweet, but tangy flavor. A skilled Herbalist can enhance the berries natural ability to affect a persons body."},
			{range: [10],   ingredient: "Rock Vine",      		amount: "1d4", 	form: "clusters", 	Foraging: "20", Crafting: "25" , Kit:"requires alchemist supplies", Effect: "Potion of Invulnerability", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"This extremely hardened dark green vine can be found growing in the ground near very old minerals, often seeming to feed off the minerals themselves. At first glance this vine seems completely useless to mortals, but arcane studies have shown this vine to harden a person’s skin significantly if combined with a powerful catalyst."},
			{range: [11],   ingredient: "Veinrot",      		amount: "1", 	form: "flowers", 	Foraging: "25", Crafting: "25" , Kit:"requires poisoner's kit", Effect: "Veinrot Poison (Injury or Ingested)", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"Veinrot poison is extracted from the seeds of a dark flower with same name that grows from rotting organic matter."},
			{range: [12],   ingredient: "Wolfsbane",      		amount: "1d4", 	form: "flowers", 	Foraging: "20", Crafting: "15" , Kit:"requires foraging kit", Effect: "Tincture of Werewolf's Bane", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This white-grey flower blooms only on a full moon and in high altitudes. Canines who come within 10 feet of wolfsbane must make a Wisdom save (DC 15) or be forced to move as far as they can away from the plant."}
        ],
        // mountain ingredients
        mountainTable = [
			{range: [2], 	ingredient: "Frozen Seedlings",     amount: "1d4", 	form: "peas", 		Foraging: "20", Crafting: "15" , Kit:"requires poisoner's kit", Effect: "Generic Poison (Injury). While poisoned, target’s movement speed is reduced by 10 ft for 1 minute.", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"These small, pea sized pods can be found amongst resilient flowers in very cold environments. Named for their almost frozen appearance, they can be plucked with relative ease and are often used in cold alcoholic drinks. Some assassins have found ways to crush these into a paste and hamper one’s movements."},
			{range: [3],    ingredient: "Lightning Moss",      	amount: "1d6", 	form: "clumps", 	Foraging: "15", Crafting: "15" , Kit:"requires foraging kit", Effect: "Potion of Resistance (Lightning)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This light blue moss grows only where lightning has struck and gives off a faint static electric shock when touched. If rubbed on the bottom of a creature's feet or pair of shoes, the creature's speed increases by 5 feet for 1 hour."},
			{range: [4],    ingredient: "Luminous Cap Dust",    amount: "1d6", 	form: "mushrum", 	Foraging: "20", Crafting: "15" , Kit:"requires alchemist supplies", Effect: "Potion of Heroism", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"This powder can be shook from the glowing yellow mushrooms often found in extremely dark environments and it keeps an ember-like glow for about a week after extracted. Many Herbalists keep the glowing mushrooms themselves in dark cellars in order to harvest this dust every chance they can."},
			{range: [5],    ingredient: "Rock Vine",      		amount: "1d4", 	form: "clusters", 	Foraging: "20", Crafting: "25" , Kit:"requires alchemist supplies", Effect: "Potion of Invulnerability", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"This extremely hardened dark green vine can be found growing in the ground near very old minerals, often seeming to feed off the minerals themselves. At first glance this vine seems completely useless to mortals, but arcane studies have shown this vine to harden a person’s skin significantly if combined with a powerful catalyst."},
			{range: [6],    ingredient: "Silverthorn",      	amount: "1d6", 	form: "thorns", 	Foraging: "20", Crafting: "15" , Kit:"requires foraging kit", Effect: "Oil of Sharpness", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This thorny vine is a pale silver color, and is hard as metal. Patches of silverthorn create difficult terrain, and deal 1d6 piercing damage if moved through at normal speed."},
			{range: [7,8],  ingredient: "Singing Nettle",      	amount: "2d4", 	form: "leaves", 	Foraging: "15", Crafting: "15" , Kit:"requires foraging kit", Effect: "Potion of Resistance (Thunder)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This vine has sharp, stinging hairs covering it. A creature who touches these hairs must make a Wisdom saving throw (DC 15) or be overwhelmed by the urge to bellow a song at the stop of their lungs."},
			{range: [9,1],  ingredient: "Sourgrass",      		amount: "2d4", 	form: "clumps", 	Foraging: "15", Crafting: "5" ,  Kit:"requires foraging kit", Effect: "Soothing Salve Poison (Ingested)", Workload: "Worktime: 1 day, additional Cost: 25 gp", descriptions:"This green, long-bladed grass has a pungent smell and flavor. Humanoids who come within 5 feet of uncut sourgrass must make a successful Constitution saving throw (DC 10) or become overwhelmed with nausea and inflicted with the poisoned condition for 30 seconds."},
			{range: [11],   ingredient: "Veinrot",      		amount: "1", 	form: "flowers", 	Foraging: "25", Crafting: "25" , Kit:"requires poisoner's kit", Effect: "Veinrot Poison (Injury or Ingested)", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"Veinrot poison is extracted from the seeds of a dark flower with same name that grows from rotting organic matter."},
			{range: [12],   ingredient: "Wolfsbane",      		amount: "1d4", 	form: "flowers", 	Foraging: "20", Crafting: "15" , Kit:"requires foraging kit", Effect: "Tincture of Werewolf's Bane", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This white-grey flower blooms only on a full moon and in high altitudes. Canines who come within 10 feet of wolfsbane must make a Wisdom save (DC 15) or be forced to move as far as they can away from the plant."}
        ],
        // swamp ingredients
        swampTable = [
			{range: [2],    ingredient: "Blue Toadshade",      	amount: "1d4", 	form: "stalks", 		Foraging: "20", Crafting: "15" , Kit:"requires alchemist supplies", Effect: "Potion of Gaseous Form", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"Blue Toadshade. Another common mushroom is this dark blue cap with a yellow striped stem. When disturbed, this mushroom lets off a puff of blue powder. Usually this causes no permanent harm to the surrounding creatures, but it can stain their skin and equipment for a short while. The powder is commonly used to color various inks and dyes. Herbalists usually search for the fungi around small watering holes, where aquatic life often thrives."},
			{range: [3],    ingredient: "Cosmos Glond",      	amount: "1d4", 	form: "leaves",	 		Foraging: "15", Crafting: "20" , Kit:"requires alchemist supplies", Effect: "Potion of Clairvoyance", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"This uncommon four-leafed plant is notorious for being somewhat difficult to find. This is mostly due to the plant growing about 5 feet underneath the ground, and only peeking out during its final maturity. However, it has an uncanny look of the stars in a night sky amongst its leaves."},
			{range: [4],    ingredient: "Devil's Bloodleaf",    amount: "1", 	form: "flower", 		Foraging: "25", Crafting: "20" , Kit:"requires alchemist supplies", Effect: "Potion of Vitality", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"Only a few recorded instances of this red and yellow flower exist. This large and bold red leaf can be going back in history to the dawn of humankind. It was once a popular decoration around homes and gardens, but has become one of the rarest plants in the world. It is said to give immense vitality and health to one who can properly prepare the plant."},
			{range: [5],    ingredient: "Fairy Stool",      	amount: "1d4", 	form: "stalks", 		Foraging: "20", Crafting: "15" , Kit:"requires foraging kit", Effect: "Potion of Truesight", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This small pink mushroom is most often found in fairy rings. Ingesting it causes blindness for 1 minute on a failed Constitution saving throw (DC 20), along with vivid hallucinations."},
			{range: [6],    ingredient: "Gillyweed",      		amount: "2d4", 	form: "leaves", 		Foraging: "10", Crafting: "10" , Kit:"requires foraging kit", Effect: "Potion of Waterbreathing", Workload: "Worktime: 1 days. Additional Cost 25 gp", descriptions:"This emerald green kelp is found underwater and is always covered in tiny air bubbles, which makes it easy to spot by a trained herbalist."},
			{range: [7],    ingredient: "Hagfinger",      		amount: "1d4", 	form: "dried fingers", 	Foraging: "20", Crafting: "15" , Kit:"requires foraging kit", Effect: "Pomander of Warding", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"These small tubers are a pale, sickly green and resemble long fingers. When dried and ground up into a powder, it gives off a strong aroma and can be used as an foraging and potion ingredient."},
			{range: [8],    ingredient: "Hydrathistle",      	amount: "1", 	form: "flower", 		Foraging: "15", Crafting: "10" , Kit:"requires alchemist supplies", Effect: "Potion of Water Breathing", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"Named for its appearance, this threepronged blue and black flower is often found in dark and dank environments. When used alone, the thistle has no real beneficial effects. However, skilled alchemists have been able to use highly powerful and natural water to concoct potions that allow them to breath in water."},
			{range: [9],    ingredient: "Red Amanita Mushroom", amount: "2d4", 	form: "stalks", 		Foraging: "10", Crafting: "10,15,20,25" , Kit:"requires foraging kit", Effect: "Potion of Healing (1 Dose), Potion of Greater Healing (3 Doses), Potion of Superior Healing (10 Doses), Potion of Supreme Healing (30 Doses)", Workload: "Worktime: 1 day, 3 days, 10 days, 30 days. Additional Cost: 25 gp, 100 gp, 500 gp, 1000 gp", descriptions:"This red-capped mushroom can grow to the size of a small dish. It deals 1d4 poison damage when ingested, but can be used to brew healing potions by a careful herbalist."},
			{range: [10],   ingredient: "Singing Nettle",      	amount: "2d4", 	form: "leaves", 		Foraging: "15", Crafting: "15" , Kit:"requires foraging kit", Effect: "Potion of Resistance (Thunder)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This vine has sharp, stinging hairs covering it. A creature who touches these hairs must make a Wisdom saving throw (DC 15) or be overwhelmed by the urge to bellow a song at the stop of their lungs."},
			{range: [11],   ingredient: "Veinrot",     	 		amount: "1", 	form: "flowers",		Foraging: "25", Crafting: "25" , Kit:"requires poisoner's kit", Effect: "Veinrot Poison (Injury or Ingested)", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"Veinrot poison is extracted from the seeds of a dark flower with same name that grows from rotting organic matter."},
			{range: [12],   ingredient: "Weeddirenna",      	amount: "1d6", 	form: "weeds", 			Foraging: "15", Crafting: "13" , Kit:"requires poisoner's kit", Effect: "Lockjaw  Poison (Ingested) ", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This substance can be made from a weed that grows in swampy areas. On its own, the weed only causes mild numbness, but once refined it is a decent paralytic."}
        ],
        // underdark ingredients
        underdarkTable = [
			{range: [2],    ingredient: "Balck Ivy",      		amount: "1d4", form: "leaves", Foraging: "25", Crafting: "16" , Kit:"requires poisoner's kit", Effect: "Black Ivy Paste Poison (Contact)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"Rare dark poisonous plant"},
			{range: [3],    ingredient: "Darkorn",      		amount: "1d4", form: "clusters", Foraging: "15", Crafting: "12" , Kit:"requires poisoner's kit", Effect: "Brawler's Bourbon Poison (Contact)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"A narcotic plant that resembles black corn, but grows low to the ground and only in the underdark. The kernels are ground to a pulp and mixed into a liquid, typically bourbon."},
			{range: [4],    ingredient: "Devil’s Bloodleaf",    amount: "1", form: "flower", Foraging: "25", Crafting: "20" , Kit:"requires alchemist supplies", Effect: "Potion of Vitality", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"Only a few recorded instances of this red and yellow flower exist. This large and bold red leaf can be going back in history to the dawn of humankind. It was once a popular decoration around homes and gardens, but has become one of the rarest plants in the world. It is said to give immense vitality and health to one who can properly prepare the plant."},
			{range: [5],    ingredient: "Fiend’s Ivy",      	amount: "1d4", form: "thorns", Foraging: "20", Crafting: "20" , Kit:"requires alchemist supplies", Effect: "Potion of Mind Reading", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"These long, red thorn-encrusted vines can stretch up to 3 feet long and have sharp thorns that reach up to an inch or two long. It isn’t rare to find blood stains amongst these vines as many animals and adventurers can easily trip or get caught in a bushel of the vines. The vines also seem to have a sentient quality to them as they relax when prey is near, and contract when captured."},
			{range: [6],    ingredient: "Luminous Cap Dust",    amount: "1d6", form: "mushrum", Foraging: "20", Crafting: "15" , Kit:"requires alchemist supplies", Effect: "Potion of Heroism", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"This powder can be shook from the glowing yellow mushrooms often found in extremely dark environments and it keeps an ember-like glow for about a week after extracted. Many Herbalists keep the glowing mushrooms themselves in dark cellars in order to harvest this dust every chance they can."},
			{range: [7],    ingredient: "Mandrake Root",      	amount: "1d4", form: "roots", Foraging: "15", Crafting: "15" , Kit:"requires foraging kit", Effect: "Drow Poison", Workload: "Worktime: 1 days. Additional Cost 25 gp", descriptions:"This twisted pale root resembles a gnarled humanoid infant. It inflicts the poisoned condition for 1 hour when ingested."},
			{range: [8],    ingredient: "Mindflayer Stinkhorn",	amount: "1d4", form: "stalks", Foraging: "15", Crafting: "10" , Kit:"requires foraging kit", Effect: "Potion of Resistance (Psychic)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This purple fungus has slimy, tentacle-looking stalks and smells of rotting flesh. A creature who eats this fungus must make a Constitution saving throw (DC10). On a success, the creature can cast detect thoughts at will for 1 hour, requiring no material components. On a failure, the creature takes 1d6 psychic damage."},
			{range: [9],    ingredient: "Mortflesh Powder",     amount: "1", form: "bulb", Foraging: "25", Crafting: "25" , Kit:"requires alchemist supplies", Effect: "Potion of Longevity", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"This dark purple powder is often found growing on top of moss in dark, cold environments. This powder is often used as makeup for young men and women to reduce the look of age from their faces. When imbibed with a magical catalyst, the effect is said to be permanent when consumed"},
			{range: [10],   ingredient: "Othur",      			amount: "1d4", form: "mushrooms", Foraging: "18", Crafting: "19" , Kit:"requires poisoner's kit", Effect: "Burnt Othur Fumes Poison (Inhaled)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"A mushroom with a black cap and a bright red stalk"},
			{range: [11],   ingredient: "Veinrot",      		amount: "1", form: "flowers", Foraging: "25", Crafting: "25" , Kit:"requires poisoner's kit", Effect: "Veinrot Poison (Injury or Ingested)", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"Veinrot poison is extracted from the seeds of a dark flower with same name that grows from rotting organic matter."},
			{range: [12],   ingredient: "Wisp Stalks",      	amount: "1d4", form: "fungi", Foraging: "25", Crafting: "25" , Kit:"requires alchemist supplies", Effect: "Potion of Invisibility", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"This incredibly rare fungi has become something of a fable amongst herbalists. It is reported to have a large bulbous cap growing atop a thin stem, and to normally form in small clusters deep within damp cave environments and forests. The organism is usually a translucent blue, and is rumored to render creatures invisible once consumed."}
        ],
		// vulcanic ingredients
        vulcanTable = [
			{range: [2],    ingredient: "Black Lotus",  amount: "1", 	form: "flower", 	Foraging: "25", Crafting: "22" , Kit:"requires poisoner's kit", Effect: "Black Lotus Extract Poison (Contact)", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"Most rare plant knowed. A beautifull vilet and black lotus that growth only near vulcanic lakes"},
			{range: [3],    ingredient: "Ashblossom",   amount: "1d6", 	form: "blossoms", 	Foraging: "20", Crafting: "15" , Kit:"requires foraging kit", 	Effect: "Potion of Resistance (Fire)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This tiny flower is bright red with a yellow center, and is found growing only in hot environments. It deals 1d4 fire damage when ingested, but it can be used to brew many fire-related potions by a knowledgeable alchemist."},
			{range: [4,5],  ingredient: "Blood Tree",   amount: "1d4", 	form: "doses", 		Foraging: "15", Crafting: "15" , Kit:"requires poisoner's kit", Effect: "Assassin's Blood (Ingested)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"This poison can be extracted from a rare tree known as the blood tree, whose sap is thick, red, and poisonous. It requires no further preparation."},
			{range: [6,7],  ingredient: "Golden Star",  amount: "1d6", 	form: "flowers", 	Foraging: "17", Crafting: "15" , Kit:"requires poisoner's kit", Effect: "Truth Serum (Ingested)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"A golde bright plat with orange flowers"},
			{range: [8],    ingredient: "Mallos",      amount: "1d4", 	form: "seeds", 		Foraging: "18", Crafting: "25" , Kit:"requires poisoner's kit", Effect: "The Fate of Mallos (Ingested)", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"A golden bell flower"},
			{range: [9],    ingredient: "Naiola",      	amount: "1d4", 	form: "seeds", 		Foraging: "19", Crafting: "15" , Kit:"requires poisoner's kit", Effect: "Azuth's Forgetting Poison (Injury)", Workload: "Worktime: 3 days. Additional Cost 100 gp", descriptions:"Seeds from these slender, pink flowers are poisonous"},
			{range: [10],   ingredient: "Neathera",     amount: "1d4", 	form: "bulbs", 		Foraging: "17", Crafting: "15" , Kit:"requires poisoner's kit", Effect: "Essence of Ether (Inhaled)", Workload: "Worktime: 1 days. Additional Cost 50 gp", descriptions:"The liquid opf this plant that vaporizes into this gas creating a potent vapor that disperses quickly."},
			{range: [11],   ingredient: "Serpent Eyes",	mount: "1d4", 	form: "leaves", 	Foraging: "25", Crafting: "25" , Kit:"requires poisoner's kit", Effect: "Pallid Serpent's Deception Poison (Ingested)", Workload: "Worktime: 10 days. Additional Cost 500 gp", descriptions:"A rare plants found within active Vulcanos. The milky substance producted has a rather intoxicating aroma that often is mistaken for cooked meat."},
			{range: [12],   ingredient: "Veinrot",      amount: "1", 	form: "flowers", 	Foraging: "25", Crafting: "25" , Kit:"requires poisoner's kit", Effect: "Veinrot Poison (Injury or Ingested)", Workload: "Worktime: 30 days. Additional Cost 1000 gp", descriptions:"Veinrot poison is extracted from the seeds of a dark flower with same name that grows from rotting organic matter."}
        ],
	  // mapping between terrain name and ingredient tables
        terrainMap = {
            "common": commonTable,
            "arctic": arcticTable,
            "coastal": underwaterTable,
            "desert": desertTable,
            "forest": forestTable,
            "grasslands": grasslandsTable,
            "hills": hillsTable,
            "mountain": mountainTable,
            "swamp": swampTable,
            "underdark": underdarkTable,
			"vulcanic": vulcanTable
        },
     // mapping between terrain and percentual fo finding herbs
       findPercentage = {
		"common": 50,
		"arctic": 20,
		"coastal": 40,
        "desert": 15,
        "forest": 55,
        "grasslands": 55,
        "hills": 35,
        "mountain": 30,
        "swamp": 45,
		"underdark": 50,
		"vulcanic": 20
		},
    replaceTemplateValues = function(result) {
        var message = 
		
		msgFormat.replace('!terrain', result.terrain).replace('!roll', result.roll).replace('!amount', result.amount).replace('!ingredient', result.ingredient).replace('!form', result.form).replace('!Kit', result.Kit).replace('!Foraging', result.Foraging).replace('!Crafting', result.Crafting).replace('!descriptions', result.descriptions).replace('!Effect', result.Effect).replace('!Workload', result.Workload).replace('!percentFind', result.percentFind).replace('!percentuale', result.percentuale);
        if(result.additionalRules){
            return message + " {{notes="+result.additionalRules+"}}";
        } else {
            return message;
        }
    },
    writeResult = function(msg, isPrivate, result) {
        var message, speakingAs;
        if(result.error) {
            message = result.message + "\n" + helpMsg;
            speakingAs = tableName;
        } else {
            speakingAs = msg.who || tableName;
            message = replaceTemplateValues(result);
        }
        if(isPrivate) {
            speakingAs = tableName;
            message = "/w "+msg.who+" "+message;
        }
        sendChat(speakingAs, message);
    },

    rollOnTable = function(terrain) {
        var terrainName, terrainTable, percentuale;
        terrainName = terrain || "common";
        terrainTable = terrainMap[terrainName];
		percentuale =findPercentage[terrainName];
        if(terrainTable === undefined) {
            return {
                error: true,
                message: "Unknown terrain '"+terrainName+"'"
            };
        } else {
			var percentFind = randomInteger(100) ;   
            var roll = randomInteger(6) + randomInteger(6);
            var checkRange = function(entry){ return entry.range.indexOf(roll) !== -1 };
            var entry = _.find(terrainTable, checkRange);
            if(entry.ingredient == "Bloodgrass" && autoReRerollIfBloodgrass) {
                return rollOnTable(terrain);
            }
          
			 if(entry.ingredient == "Common Ingredient" && autoRollIfCommon) {
                return rollOnTable("common");
            }
			  if(percentFind < percentuale)  {
            return {
                terrain: terrainName,
                roll: roll,
				percentFind:percentFind,
				percentuale:percentuale,
				Kit: entry.Kit,
                amount: entry.amount,
                ingredient: entry.ingredient,
				form: entry.form,
				Foraging: entry.Foraging,
				Crafting: entry.Crafting,
                additionalRules: entry.additionalRules,
				descriptions: entry.descriptions,
				Effect: entry.Effect,
				Workload: entry.Workload
            }
			}
			else {
            return {
                terrain: terrainName,
                roll: roll,
				percentFind:percentFind,
				percentuale:percentuale,
				Kit: "",
                amount: 0,
                ingredient: "Non hai trovato alcuna erba interessante nella zona che hai setacciato. Riprova da un'altra parte",
				form: "",
				Foraging: "--",
				Crafting: "--",
                additionalRules: "--",
				descriptions: "--",
				Effect: "--",
				Workload: "--"
            }
			};                        
        }
    },
    handleInput = function(msg) {
        var args, command, param;
        if(msg.type !== "api") {
            return;
        }
        args = msg.content.split(/\s+/);
        command = args.shift();
        switch (command) {
            case "!herbs":
            case "!foraging":
                param = args.shift();
                if (param == "--help" || param == "-h")
                    sendChat(tableName, helpMsg);
                else {
                    var isPrivate = false;
                    if(param == "--private" || param == "-w") {
                        isPrivate = true;
                        param = args.shift();
                    }
                    writeResult(msg, isPrivate, rollOnTable(param));
                }
                return;
        }
    },

    checkInstall = function() {
        log(tableName+' v'+version+' Ready');
    },

    registerEventHandlers = function() {
        on("chat:message", handleInput);
    };

    return {
		checkInstall: checkInstall,
        registerEventHandlers: registerEventHandlers
	};
}());

on('ready', function() {
    'use strict';
    foraging.checkInstall();
    foraging.registerEventHandlers();
});
