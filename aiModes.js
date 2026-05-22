export const aiModes = {

  Professional:{

    title:
      "Professional",

    prompt:
      "Rewrite this message professionally with confidence, clarity and intelligence."

  },

  Romantic:{

    title:
      "Romantic",

    prompt:
      "Rewrite this message romantically and emotionally attractive."

  },

  Friendly:{

    title:
      "Friendly",

    prompt:
      "Rewrite this message in a warm friendly tone."

  },

  CEO:{

    title:
      "CEO",

    prompt:
      "Rewrite this message like a powerful CEO speaking confidently."

  },

  Persuasive:{

    title:
      "Persuasive",

    prompt:
      "Rewrite this message persuasively to convince the receiver."

  },

  Flirty:{

    title:
      "Flirty",

    prompt:
      "Rewrite this message in a playful and flirty style."

  },

  Apology:{

    title:
      "Apology",

    prompt:
      "Rewrite this message as a sincere apology."

  },

  GenZ:{

    title:
      "Gen Z",

    prompt:
      "Rewrite this message using modern Gen Z texting style."

  }

};

/* ====================================
   GET PROMPT
==================================== */

export function getPrompt(

  mode,
  text

){

  const selected =

    aiModes[mode]

    || aiModes.Professional;

  return `

${selected.prompt}

Message:
${text}

`;

}