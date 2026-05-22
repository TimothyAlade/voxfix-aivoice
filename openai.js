/* ====================================
   PREMIUM CHECK
==================================== */

function isPremiumUser(){

  return localStorage.getItem(
    "voxfixPremium"
  ) === "true";

}

/* ====================================
   FREE LIMIT
==================================== */

function canUseFreeAI(){

  const today =
    new Date().toDateString();

  const storedDate =
    localStorage.getItem(
      "voxfixUsageDate"
    );

  let usage =
    parseInt(

      localStorage.getItem(
        "voxfixUsage"
      )

    ) || 0;

  if(storedDate !== today){

    localStorage.setItem(
      "voxfixUsageDate",
      today
    );

    localStorage.setItem(
      "voxfixUsage",
      "0"
    );

    usage = 0;

  }

  return usage < 5;

}

/* ====================================
   INCREASE USAGE
==================================== */

function increaseUsage(){

  let usage =
    parseInt(

      localStorage.getItem(
        "voxfixUsage"
      )

    ) || 0;

  usage++;

  localStorage.setItem(
    "voxfixUsage",
    usage
  );

}

/* ====================================
   AI GENERATION
==================================== */

export async function generateAIResponse(
  prompt
){

  try{

    const premium =
      isPremiumUser();

    if(!premium){

      const allowed =
        canUseFreeAI();

      if(!allowed){

        return `
Free limit reached.

Upgrade to premium for:
• Unlimited AI rewrites
• Voice transcription
• 100+ languages
• Faster AI generation
        `;

      }

      increaseUsage();

    }

    const response =
      await fetch(

        "/api/generate",

        {

          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            prompt,
            premium

          })

        }

      );

    const data =
      await response.json();

    if(data.error){

      return data.error;

    }

    return data.result;

  }catch(error){

    console.error(error);

    return `
AI server unavailable.

Please try again later.
    `;

  }

}