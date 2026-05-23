import fs from "fs";
import path from "path";
import os from "os";

/* ====================================
   CONFIG
==================================== */

export const config = {

  api:{
    bodyParser:false
  }

};

/* ====================================
   PARSE MULTIPART
==================================== */

async function parseForm(req){

  const formidable =
    (await import("formidable")).default;

  const form =
    formidable({

      multiples:false,

      uploadDir:
        os.tmpdir(),

      keepExtensions:true

    });

  return new Promise((resolve,reject)=>{

    form.parse(

      req,

      (err,fields,files)=>{

        if(err){

          reject(err);

        }else{

          resolve({
            fields,
            files
          });

        }

      }

    );

  });

}

/* ====================================
   TRANSCRIBE
==================================== */

export default async function handler(
  req,
  res
){

  if(req.method !== "POST"){

    return res.status(405).json({

      error:
        "Method not allowed"

    });

  }

  try{

    /* ====================================
       GET FILE
    ==================================== */

    const {

      files

    } = await parseForm(req);

    const audio =
      files.audio?.[0]
      ||
      files.audio;

    if(!audio){

      return res.status(400).json({

        error:
          "No audio uploaded"

      });

    }

    /* ====================================
       FILE VALIDATION
    ==================================== */

    const allowedTypes = [

      "audio/mpeg",

      "audio/mp3",

      "audio/wav",

      "audio/webm",

      "audio/mp4",

      "audio/x-m4a"

    ];

    if(
      !allowedTypes.includes(
        audio.mimetype
      )
    ){

      return res.status(400).json({

        error:
          "Unsupported audio format"

      });

    }

    /* ====================================
       SIZE LIMIT
    ==================================== */

    const maxSize =
      10 * 1024 * 1024;

    if(audio.size > maxSize){

      return res.status(400).json({

        error:
          "Audio exceeds 10MB"

      });

    }

    /* ====================================
       OPENAI FORM
    ==================================== */

    const formData =
      new FormData();

    const fileBuffer =
      fs.readFileSync(
        audio.filepath
      );

    const blob =
      new Blob([fileBuffer]);

    formData.append(

      "file",

      blob,

      audio.originalFilename

    );

    formData.append(
      "model",
      "whisper-1"
    );

    formData.append(
      "response_format",
      "json"
    );

    /* ====================================
       OPENAI REQUEST
    ==================================== */

    const response =
      await fetch(

        "https://api.openai.com/v1/audio/transcriptions",

        {

          method:"POST",

          headers:{

            Authorization:
`Bearer ${process.env.OPENAI_API_KEY}`

          },

          body:formData

        }

      );

    const data =
      await response.json();

    console.log(data);

    /* ====================================
       ERROR
    ==================================== */

    if(data.error){

      return res.status(500).json({

        error:
          data.error.message

      });

    }

    /* ====================================
       SUCCESS
    ==================================== */

    return res.status(200).json({

      text:
        data.text ||

        "No transcription result"

    });

  }catch(error){

    console.error(error);

    return res.status(500).json({

      error:
        "Transcription failed"

    });

  }

}