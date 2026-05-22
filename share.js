/* ====================================
   SHARE RESULT
==================================== */

export async function shareResult(){

  try{

    const result =
      document.getElementById(
        "resultText"
      ).innerText;

    const premium =
      localStorage.getItem(
        "voxfixPremium"
      ) === "true";

    const shareText =

`${result}

Generated with VoxFix AI 🚀

${premium
? "Premium AI Experience"
: "Try VoxFix AI Premium"}

`;

    /* MOBILE SHARE */

    if(navigator.share){

      await navigator.share({

        title:
          "VoxFix AI",

        text:
          shareText

      });

      return;

    }

    /* FALLBACK */

    await navigator.clipboard.writeText(
      shareText
    );

    alert(
      "Result copied for sharing."
    );

  }catch(error){

    console.error(error);

  }

}