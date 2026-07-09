{\rtf1\ansi\ansicpg1252\cocoartf2761
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs32 \cf0 \expnd0\expndtw0\kerning0
const \{ GoogleGenAI \} = require("@google/genai");\
\
exports.handler = async (event) => \{\
  try \{\
    const ai = new GoogleGenAI(\{\
      apiKey: process.env.GEMINI_API_KEY\
    \});\
\
    const \{ prompt \} = JSON.parse(event.body || "\{\}");\
\
    const response = await ai.models.generateContent(\{\
      model: "gemini-2.0-flash",\
      contents: prompt || "Hello from Gemini!"\
    \});\
\
    return \{\
      statusCode: 200,\
      headers: \{ "Content-Type": "application/json" \},\
      body: JSON.stringify(\{ result: response.text \})\
    \};\
\
  \} catch (err) \{\
    return \{\
      statusCode: 500,\
      body: JSON.stringify(\{ error: err.message \})\
    \};\
  \}\
\};}