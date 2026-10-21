'use strict';
/* Stylised, original cartoon icons inspired by each artist's signature look.
   The lines are original text written for this app — they are NOT real quotes. */
const svg = (id, body) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="c-${id}"><circle cx="32" cy="32" r="31"/></clipPath></defs><circle cx="32" cy="32" r="31" fill="#141416"/><g clip-path="url(#c-${id})">${body}</g><circle cx="32" cy="32" r="30.5" fill="none" stroke="#d7263d" stroke-width="1.5"/></svg>`;

const MASCOTS = [
  {
    id: 'corey', name: 'Corey', band: 'Slipknot-style mask',
    svg: svg('corey', `
      <g fill="none" stroke-linecap="round" stroke-width="5.5">
        <path d="M22 14 Q10 22 9 44 Q8 56 11 66" stroke="#3f8f3a"/><path d="M26 12 Q16 26 17 46 Q17 56 19 66" stroke="#2f7a2c"/>
        <path d="M42 14 Q54 22 55 44 Q56 56 53 66" stroke="#3f8f3a"/><path d="M38 12 Q48 26 47 46 Q47 56 45 66" stroke="#2f7a2c"/>
        <path d="M28 10 Q24 4 18 3" stroke="#3f8f3a"/><path d="M36 10 Q40 4 46 3" stroke="#3f8f3a"/>
      </g>
      <ellipse cx="32" cy="30" rx="16" ry="22" fill="#cfcfc6"/>
      <path d="M17 24 Q32 12 47 24" stroke="#a9a9a0" stroke-width="1.5" fill="none"/>
      <path d="M32 9 V20" stroke="#a9a9a0" stroke-width="1.2"/>
      <ellipse cx="25.5" cy="29" rx="4" ry="2.2" fill="#0d0d0e" transform="rotate(12 25.5 29)"/>
      <ellipse cx="38.5" cy="29" rx="4" ry="2.2" fill="#0d0d0e" transform="rotate(-12 38.5 29)"/>
      <path d="M32 31 v7" stroke="#555" stroke-width="1.6"/>
      <path d="M23 44 H41" stroke="#222" stroke-width="2.2"/>
      <path d="M25 42 v5 M29 42 v5 M33 42 v5 M37 42 v5" stroke="#222" stroke-width="1.2"/>`),
    lines: {
      idle: ['Mask on, maggots. Time to get ugly.', 'Heavy things exist to be picked up and thrown around.', "Nobody's coming to save you. Lift something.", "Stop staring at the bar and pick it up.", "Scared? Good. Use it."],
      start: ['Get your head right. Then wreck the bar.', 'Warm up. Then make a mess.', "Put the phone down. Pick the weight up.", "Mask on. Brain off. Lift.", "Let's see what you've got, maggot."],
      set: ['Ugly and loud. That\'s how it\'s done.', 'That one hurt, didn\'t it? Good.', 'Don\'t whine. Next set.', "Now that's disgusting. Beautiful.", "Less thinking, more screaming. Next.", "Your muscles hate you. Keep going.", "Not bad. Not great. Do it again."],
      rest: ['Quit lounging. Get back under it.', 'Break\'s over. Back to work, maggot.', "Rest is for the weak. Ninety seconds, tops.", "The bar's still waiting. So am I.", "Get up. Nobody likes a statue."],
      done: ['Done. Now go be a menace somewhere else.', 'You bled for that one. Respect.', "Go home. Eat something. You're a mess.", "Another day, another beating. Nice one.", "You survived. Barely. Love it."],
    },
  },
  {
    id: 'serj', name: 'Serj', band: 'System-style chaos',
    svg: svg('serj', `
      <ellipse cx="32" cy="33" rx="13" ry="16" fill="#d8a780"/>
      <g fill="#4a4040">
        <circle cx="19" cy="28" r="4.6"/><circle cx="19" cy="22" r="4.6"/><circle cx="22" cy="16" r="4.6"/><circle cx="28" cy="13" r="4.6"/><circle cx="36" cy="13" r="4.6"/><circle cx="42" cy="16" r="4.6"/><circle cx="45" cy="22" r="4.6"/><circle cx="45" cy="28" r="4.6"/>
      </g>
      <g fill="#625454">
        <circle cx="24" cy="19" r="3.8"/><circle cx="32" cy="17" r="3.8"/><circle cx="40" cy="19" r="3.8"/><circle cx="21" cy="23" r="3.8"/><circle cx="43" cy="23" r="3.8"/>
      </g>
      <path d="M22 28 l8 -1 M42 28 l-8 -1" stroke="#2a2222" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="26.5" cy="31" r="1.8" fill="#1a1414"/><circle cx="37.5" cy="31" r="1.8" fill="#1a1414"/>
      <path d="M26 42 C26 48 38 48 38 42 Q32 44 26 42Z" fill="#2a2121"/>
      <path d="M27.5 46 Q32 68 36.5 46Z" fill="#2a2121"/>
      <path d="M26.5 40.5 Q32 37.5 37.5 40.5 Q32 43 26.5 40.5Z" fill="#1c1515"/>
      <path d="M29 44.5 h6" stroke="#d8a780" stroke-width="1.4" stroke-linecap="round"/>`),
    lines: {
      idle: ['Question everything. Especially your excuses.', 'Power to the people. Start with the legs.', "Be an agent of change. Start with a squat.", "Stay loud, stay weird, stay strong.", "Stand up for something. Today, it's a deadlift."],
      start: ['The revolution begins with a warm-up.', 'Don\'t follow orders. Write your own programme.', "Today's agenda: lift heavy, think freely.", "Warm up your muscles and your opinions.", "Wake up. The bar won't lift itself."],
      set: ['Resist the urge to quit. Again!', 'The system wants you sitting down. Stand up and lift.', 'One more rep for the people.', "Unite the muscle fibres. Again!", "Power to the biceps. Next set.", "Fight apathy. One more rep.", "Strength for everyone. Starting with you."],
      rest: ['Intermission over. Rise up.', 'Get organised. Back to the bar.', "The people demand another set.", "Recess is over. Back to the barricade.", "Rest is a right, not a lifestyle. Go."],
      done: ['The revolution will be sweaty. Well done.', 'Nobody handed you strength. You took it.', "Historic session. Future generations will weep.", "The movement thanks you. Hydrate.", "Peaceful protest, aggressive deadlifts. Great job."],
    },
  },
  {
    id: 'oli', name: 'Oli', band: 'Bring-me-style curls',
    svg: svg('oli', `
      <rect x="8" y="52" width="48" height="14" rx="8" fill="#181818"/>
      <rect x="27" y="44" width="10" height="12" fill="#e3b894"/>
      <path d="M28 49 q2 2 4 0 q2 2 4 0 M29 53 h6" stroke="#2b2b2b" stroke-width="1.2" fill="none"/>
      <ellipse cx="32" cy="33" rx="13" ry="15" fill="#e3b894"/>
      <g fill="#2e2118">
        <circle cx="19" cy="28" r="4.6"/><circle cx="19" cy="22" r="4.6"/><circle cx="22" cy="16" r="4.6"/><circle cx="28" cy="13" r="4.6"/><circle cx="36" cy="13" r="4.6"/><circle cx="42" cy="16" r="4.6"/><circle cx="45" cy="22" r="4.6"/><circle cx="45" cy="28" r="4.6"/>
      </g>
      <g fill="#4a3626">
        <circle cx="24" cy="19" r="3.8"/><circle cx="32" cy="17" r="3.8"/><circle cx="40" cy="19" r="3.8"/><circle cx="21" cy="23" r="3.8"/><circle cx="43" cy="23" r="3.8"/>
      </g>
      <circle cx="26.5" cy="32" r="1.8" fill="#222"/><circle cx="37.5" cy="32" r="1.8" fill="#222"/>
      <path d="M23 28 l7 -1 M41 28 l-7 -1" stroke="#2a1d12" stroke-width="2" stroke-linecap="round"/>
      <path d="M26 41 q6 4 12 0" stroke="#7a4b3a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <circle cx="19" cy="38" r="1.8" fill="none" stroke="#bbb" stroke-width="1"/>`),
    lines: {
      idle: ['Right then, no excuses today, mate.', 'Rough day? Get a brew, then smash a few sets.', "Chin up, mate. You've got this.", "Not feeling it? Do one set and see.", "Today's a good day to be a bit stronger."],
      start: ['Come on then, let\'s have it.', 'Kettle\'s on after this. Let\'s crack on.', "Right, let's get stuck in.", "Deep breath, shoulders back. Off we go.", "Brilliant, you showed up. That's half of it."],
      set: ['Lovely stuff, that. Go again.', 'Proper effort, mate. Cracking set.', 'Bloody hell, look at you go.', "Smashed it, mate. Absolutely smashed it.", "Get in! Go on, another one.", "That's the stuff. You're flying.", "Not bad at all, that. Not bad at all."],
      rest: ['Right, tea break\'s over. Back on it.', 'Come on, you muppet. The bar\'s waiting.', "Right, enough sitting about. Up you get.", "Chop chop, mate. Time's a-ticking.", "Come on, champion. One more round."],
      done: ['Absolutely sound session, mate. Brew time.', 'Proper graft, that. Get yourself a cuppa.', "Cheers for that. Cracking session.", "Top effort, mate. Put your feet up.", "Job done. Fancy a brew?"],
    },
  },
  {
    id: 'vessel', name: 'Vessel', band: 'Sleep-Token-style ritual',
    svg: svg('vessel', `
      <path d="M2 66 C4 38 14 8 32 4 C50 8 60 38 62 66Z" fill="#3a3c41" stroke="#74777e" stroke-width="1.2"/>
      <path d="M14 66 C15 44 21 20 32 16 C43 20 49 44 50 66Z" fill="#131416"/>
      <ellipse cx="32" cy="33" rx="12.5" ry="16.5" fill="#f1ece4" stroke="#d9d2c6" stroke-width="1"/>
      <path d="M32 17 V50" stroke="#c4314b" stroke-width="2.2"/>
      <path d="M32 21 Q22 24 20 33 M32 21 Q42 24 44 33" stroke="#c4314b" stroke-width="1.2" fill="none"/>
      <ellipse cx="25.5" cy="31" rx="3.6" ry="1.7" fill="#120305"/><ellipse cx="38.5" cy="31" rx="3.6" ry="1.7" fill="#120305"/>
      <path d="M21 36 Q25 41 29 38 M43 36 Q39 41 35 38" stroke="#c4314b" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="24" r="2.4" fill="#c4314b"/>
      <path d="M27 45 q5 2.4 10 0" stroke="#c4314b" stroke-width="1.5" fill="none" stroke-linecap="round"/>`),
    lines: {
      idle: ['The ritual awaits. Step forward.', 'Offer your effort to the iron.', "Strength is a quiet devotion.", "The faithful do not skip leg day.", "Return, and be rebuilt."],
      start: ['Begin the ritual.', 'Close your eyes. Then lift.', "Enter. Leave the day behind.", "The altar is ready. Approach.", "Kneel, then rise. The set begins."],
      set: ['Another offering made. Continue.', 'The iron accepts it.', 'Steady. Devoted. Again.', "The iron remembers your devotion.", "Each rep is a prayer. Say another.", "You are becoming something greater.", "Breathe. Lift. Repeat the rite."],
      rest: ['The pause ends. Return to the bar.', 'Rise. The next set calls.', "The silence is over. Return.", "Rise. The bar awaits its worshipper.", "Your rest is complete. Begin again."],
      done: ['The ritual is complete. Rest well.', 'You are a little stronger than before.', "The rite is finished. Go in peace.", "You gave everything. The iron is pleased.", "Rest. Tomorrow, we begin again."],
    },
  },
  {
    id: 'shadows', name: 'Shadows', band: 'Avenged-style swagger',
    svg: svg('shadows', `
      <defs><pattern id="plaid" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="#a3212a"/><rect width="10" height="3" fill="#1b1b1b" opacity=".75"/><rect width="3" height="10" fill="#1b1b1b" opacity=".75"/>
        <rect y="6" width="10" height="1" fill="#f0c9a0" opacity=".5"/><rect x="6" width="1" height="10" fill="#f0c9a0" opacity=".5"/></pattern></defs>
      <path d="M2 66 L4 56 Q8 49 24 47 L40 47 Q56 49 60 56 L62 66Z" fill="url(#plaid)"/>
      <path d="M25 47 L32 64 L39 47Z" fill="#161616"/>
      <rect x="27" y="43" width="10" height="9" fill="#d9ab87"/>
      <path d="M22 46 L27 52 L25 58 L19 50Z M42 46 L37 52 L39 58 L45 50Z" fill="#7d1820"/>
      <ellipse cx="32" cy="32" rx="13" ry="15" fill="#d9ab87"/>
      <path d="M18 29 C14 13 22 5 34 4 C46 4 52 13 46 29 C44 21 38 16 30 16 C23 16 19 21 18 29Z" fill="#4a4444"/>
      <path d="M20 37 C21 50 43 50 44 37 C41 42 37 43 32 43 C27 43 23 42 20 37Z" fill="#4a4444"/>
      <rect x="19" y="27" width="11" height="7" rx="2.5" fill="#101010"/><rect x="34" y="27" width="11" height="7" rx="2.5" fill="#101010"/>
      <rect x="30" y="29" width="4" height="1.6" fill="#101010"/>
      <path d="M21 29 l4 0 M36 29 l4 0" stroke="#d7263d" stroke-width="1.6" opacity=".7"/>
      <path d="M28 40 h8" stroke="#8a5a45" stroke-width="1.6" stroke-linecap="round"/>`),
    lines: {
      idle: ['Another day, another reason to crush it, brother.', 'Huntington Beach strong. Let\'s go.', "Let's make today a classic, brother.", "Fire up the amp. Lift something loud.", "Rock stars don't skip warm-ups. Let's go."],
      start: ['Alright dudes, soundcheck\'s over. Let\'s lift.', 'Throw on the flannel and get after it.', "Lights are down. Crowd's waiting. Let's lift.", "Tune up, bro. It's go time.", "Grab the bar. We've got a show to play."],
      set: ['Sick set, bro. Shred the next one.', 'That\'s a face-melter. Keep it rolling.', 'Dude, you\'re on fire. Again.', "That set was pure riff, dude.", "Absolute beast mode. Shred it again.", "Crowd's going wild. One more.", "Nailed it, brother. Next song."],
      rest: ['Back on stage, brother. Hit it.', 'Okay, rock star. Encore set. Go.', "Intermission's over, dude. Back out there.", "Pick up the bar, rock star.", "Tuned up and rested. Hit it."],
      done: ['That was a headliner session, dude. Respect.', 'Big show tonight. Go grab some food, brother.', "Standing O, dude. That was a banger.", "Killer set list tonight. Go crash.", "Show's over, legend. Great work."],
    },
  },
];
