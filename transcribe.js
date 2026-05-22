/* ====================================
   PREMIUM CHECK
==================================== */

function isPremiumUser(){

  return localStorage.getItem(
    "voxfixPremium"
  ) === "true";

}

/* ====================================
   TRANSCRIBE
==================================== */

export async function transcribeAudio(
  file
){

  try{

    if(!isPremiumUser()){

      return `
Premium required for voice transcription.
      `;

    }

    /* FILE SIZE LIMIT */

    const maxSize =
      10 * 1024 * 1024;

    if(file.size > maxSize){

      return `
Audio too large.

Maximum:
10MB
      `;

    }

    const formData =
      new FormData();

    formData.append(
      "audio",
      file
    );

    const response =
      await fetch(

        "/api/transcribe",

        {

          method:"POST",

          body:formData

        }

      );

    const data =
      await response.json();

    if(data.error){

      return data.error;

    }

    return data.text;

  }catch(error){

    console.error(error);

    return `
Voice transcription failed.
    `;

  }

}