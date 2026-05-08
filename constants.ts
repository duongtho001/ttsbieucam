/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Voice } from './types';

// Raw data from the user request
const rawData = [
    {
      "name": "Zephyr",
      "pitch": "Higher",
      "characteristics": ["Bright"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Zephyr.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/l8ohk0ehyuwd",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium-High",
        "characteristics": ["Enthusiastic", "Young Adult", "Clear Articulation", "Upbeat", "General American Accent"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Puck",
      "pitch": "Middle",
      "characteristics": ["Upbeat"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Puck.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/pjb8nmxvv87i",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium",
        "characteristics": ["Young Adult", "Casual", "Energetic", "Approachable", "American Accent"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Charon",
      "pitch": "Lower",
      "characteristics": ["Informative"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Charon.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/eht4pbht6w16",
      "analysis": {
        "gender": "Male",
        "pitch": "Low",
        "characteristics": ["Deep", "American accent", "Calm", "Resonant", "Professional"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Kore",
      "pitch": "Middle",
      "characteristics": ["Firm"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Kore.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/5gsff9mzdklz",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium-High",
        "characteristics": ["Enthusiastic", "Bright", "Young Adult", "Clear", "Optimistic"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Fenrir",
      "pitch": "Lower middle",
      "characteristics": ["Excitable"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Fenrir.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/kbtpe6yz1777",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-Low",
        "characteristics": ["Warm", "Inquisitive", "Clear articulation", "Mid-30s", "Friendly"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Leda",
      "pitch": "Higher",
      "characteristics": ["Youthful"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Leda.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/brhw8ewgkz3q",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium-High",
        "characteristics": ["Youthful", "Inquisitive", "Bright", "Articulate", "Energetic"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Orus",
      "pitch": "Lower middle",
      "characteristics": ["Firm"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Orus.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/lyp5xb51dqrp",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-Low",
        "characteristics": ["Inquisitive", "Casual", "Clear articulation", "American accent", "Young adult"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Aoede",
      "pitch": "Middle",
      "characteristics": ["Breezy"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Aoede.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/0g78kvx54r5y",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium-High",
        "characteristics": ["Inquisitive", "Professional", "Clear articulation", "Engaging", "Optimistic"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Callirrhoe",
      "pitch": "Middle",
      "characteristics": ["Easy-going"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Callirrhoe.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/z4d483ugdfl3",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium-High",
        "characteristics": ["Friendly", "Professional", "Inquisitive", "Clear", "Engaging"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Autonoe",
      "pitch": "Middle",
      "characteristics": ["Bright"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Autonoe.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/6p49p29lx87v",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium-High",
        "characteristics": ["Warm", "Inquisitive", "Articulate", "Professional", "Encouraging"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Enceladus",
      "pitch": "Lower",
      "characteristics": ["Breathy"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Enceladus.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/idr4pg60rus1",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-Low",
        "characteristics": ["Energetic", "Confident", "Warm", "Motivating", "Clear"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Iapetus",
      "pitch": "Lower middle",
      "characteristics": ["Clear"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Iapetus.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/9dbnvhqx1pm6",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-Low",
        "characteristics": ["Confident", "Professional", "American Accent", "Inviting", "Resonant"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Umbriel",
      "pitch": "Lower middle",
      "characteristics": ["Easy-going"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Umbriel.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/m503ad9dvwdr",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-Low",
        "characteristics": ["Resonant", "Inquisitive", "Confident", "Clear Articulation", "Adult (30s-40s)"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Algieba",
      "pitch": "Lower",
      "characteristics": ["Smooth"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Algieba.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/wukcuqg2ht20",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-Low",
        "characteristics": ["Enthusiastic", "Warm", "Articulate", "Confident", "General American Accent"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Despina",
      "pitch": "Middle",
      "characteristics": ["Smooth"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Despina.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/cwkb7of0eo8k",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium-High",
        "characteristics": ["Energetic", "Inquisitive", "Warm", "Clear", "Young Adult"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Erinome",
      "pitch": "Middle",
      "characteristics": ["Clear"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Erinome.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/5d33lah5mgyn",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium",
        "characteristics": ["Confident", "Inquisitive", "Professional", "Articulate", "Sophisticated"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Algenib",
      "pitch": "Lower",
      "characteristics": ["Gravelly"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Algenib.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/gtoedjsrfdyv",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-Low",
        "characteristics": ["Mid-30s", "Inquisitive", "Smooth", "Calm", "General American Accent"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Rasalgethi",
      "pitch": "Middle",
      "characteristics": ["Informative"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Rasalgethi.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/g2sakseigjxf",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-High",
        "characteristics": ["Young Adult", "Energetic", "Inquisitive", "Clear Articulation", "General American Accent"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Laomedeia",
      "pitch": "Higher",
      "characteristics": ["Upbeat"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Laomedeia.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/rf0bd4ccuwe5",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium-High",
        "characteristics": ["Young Adult", "Inquisitive", "Warm", "Clear", "Approachable"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Achernar",
      "pitch": "Higher",
      "characteristics": ["Soft"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Achernar.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/si9idhunuhl7",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium-High",
        "characteristics": ["Warm", "Inviting", "Professional", "Clear", "Optimistic"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Alnilam",
      "pitch": "Lower middle",
      "characteristics": ["Firm"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Alnilam.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/v1jxtnndr4a8",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-High",
        "characteristics": ["Young Adult", "Energetic", "Optimistic", "Clear Articulation", "American Accent"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Schedar",
      "pitch": "Lower middle",
      "characteristics": ["Even"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Schedar.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/k80e0tzz69bm",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium",
        "characteristics": ["Young Adult", "Energetic", "Casual", "American Accent", "Approachable"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Gacrux",
      "pitch": "Middle",
      "characteristics": ["Mature"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Gacrux.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/y27p0f291okv",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium",
        "characteristics": ["Warm", "Inquisitive", "Clear articulation", "Engaging", "Young adult"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Pulcherrima",
      "pitch": "Middle",
      "characteristics": ["Forward"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Pulcherrima.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/90hmlsqpuflo",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-High",
        "characteristics": ["Energetic", "Youthful", "Optimistic", "Clear", "Inviting"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Achird",
      "pitch": "Lower middle",
      "characteristics": ["Friendly"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Achird.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/xowubdv0dj6l",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-Low",
        "characteristics": ["Warm", "Inquisitive", "Professional", "Articulate", "Mid-30s"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Zubenelgenubi",
      "pitch": "Lower middle",
      "characteristics": ["Casual"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Zubenelgenubi.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/doh1fjcgze3d",
      "analysis": {
        "gender": "Male",
        "pitch": "Low",
        "characteristics": ["deep", "resonant", "sophisticated", "confident", "articulate"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Vindemiatrix",
      "pitch": "Middle",
      "characteristics": ["Gentle"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Vindemiatrix.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/61crfv4pato0",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium-High",
        "characteristics": ["Young adult", "Warm", "Inquisitive", "Clear enunciation", "Smooth"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Sadachbia",
      "pitch": "Lower",
      "characteristics": ["Lively"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Sadachbia.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/5e3wo1zq9wqy",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-Low",
        "characteristics": ["Resonant", "Inquisitive", "Professional", "Clear articulation", "American accent"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Sadaltager",
      "pitch": "Middle",
      "characteristics": ["Knowledgeable"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Sadaltager.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/nqounelpnqsk",
      "analysis": {
        "gender": "Male",
        "pitch": "Medium-Low",
        "characteristics": ["Professional", "Inquisitive", "Articulate", "Approachable", "Calm"],
        "visualDescription": "..."
      }
    },
    {
      "name": "Sulafat",
      "pitch": "Middle",
      "characteristics": ["Warm"],
      "audioSampleUrl": "https://gstatic.com/aistudio/voices/samples/Sulafat.wav",
      "fileUri": "https://generativelanguage.googleapis.com/v1beta/files/2y1in981v1rz",
      "analysis": {
        "gender": "Female",
        "pitch": "Medium-High",
        "characteristics": ["Warm", "Enthusiastic", "Clear articulation", "Young adult", "Professional"],
        "visualDescription": "..."
      }
    }
  ];

// Enhance data with local images from the root folder
// We use string paths assuming the images are served from the public root
export const VOICE_DATA: Voice[] = rawData.map((voice) => ({
  ...voice,
  imageUrl: `https://www.gstatic.com/aistudio/starter-apps/voice-library/${voice.name}.jpeg`
}));

export const SUPPORTED_LANGUAGES = [
  { name: "Arabic", code: "ar" },
  { name: "Bangla", code: "bn" },
  { name: "Dutch", code: "nl" },
  { name: "English", code: "en" },
  { name: "French", code: "fr" },
  { name: "German", code: "de" },
  { name: "Hindi", code: "hi" },
  { name: "Indonesian", code: "id" },
  { name: "Italian", code: "it" },
  { name: "Japanese", code: "ja" },
  { name: "Korean", code: "ko" },
  { name: "Marathi", code: "mr" },
  { name: "Polish", code: "pl" },
  { name: "Portuguese", code: "pt" },
  { name: "Romanian", code: "ro" },
  { name: "Russian", code: "ru" },
  { name: "Spanish", code: "es" },
  { name: "Tamil", code: "ta" },
  { name: "Telugu", code: "te" },
  { name: "Thai", code: "th" },
  { name: "Turkish", code: "tr" },
  { name: "Ukrainian", code: "uk" },
  { name: "Vietnamese", code: "vi" },
  { name: "Afrikaans", code: "af" },
  { name: "Albanian", code: "sq" },
  { name: "Amharic", code: "am" },
  { name: "Armenian", code: "hy" },
  { name: "Azerbaijani", code: "az" },
  { name: "Basque", code: "eu" },
  { name: "Belarusian", code: "be" },
  { name: "Bulgarian", code: "bg" },
  { name: "Burmese", code: "my" },
  { name: "Catalan", code: "ca" },
  { name: "Cebuano", code: "ceb" },
  { name: "Chinese, Mandarin", code: "cmn" },
  { name: "Croatian", code: "hr" },
  { name: "Czech", code: "cs" },
  { name: "Danish", code: "da" },
  { name: "Estonian", code: "et" },
  { name: "Filipino", code: "fil" },
  { name: "Finnish", code: "fi" },
  { name: "Galician", code: "gl" },
  { name: "Georgian", code: "ka" },
  { name: "Greek", code: "el" },
  { name: "Gujarati", code: "gu" },
  { name: "Haitian Creole", code: "ht" },
  { name: "Hebrew", code: "he" },
  { name: "Hungarian", code: "hu" },
  { name: "Icelandic", code: "is" },
  { name: "Javanese", code: "jv" },
  { name: "Kannada", code: "kn" },
  { name: "Konkani", code: "kok" },
  { name: "Lao", code: "lo" },
  { name: "Latin", code: "la" },
  { name: "Latvian", code: "lv" },
  { name: "Lithuanian", code: "lt" },
  { name: "Luxembourgish", code: "lb" },
  { name: "Macedonian", code: "mk" },
  { name: "Maithili", code: "mai" },
  { name: "Malagasy", code: "mg" },
  { name: "Malay", code: "ms" },
  { name: "Malayalam", code: "ml" },
  { name: "Mongolian", code: "mn" },
  { name: "Nepali", code: "ne" },
  { name: "Norwegian, Bokmål", code: "nb" },
  { name: "Norwegian, Nynorsk", code: "nn" },
  { name: "Odia", code: "or" },
  { name: "Pashto", code: "ps" },
  { name: "Persian", code: "fa" },
  { name: "Punjabi", code: "pa" },
  { name: "Serbian", code: "sr" },
  { name: "Sindhi", code: "sd" },
  { name: "Sinhala", code: "si" },
  { name: "Slovak", code: "sk" },
  { name: "Slovenian", code: "sl" },
  { name: "Swahili", code: "sw" },
  { name: "Swedish", code: "sv" },
  { name: "Urdu", code: "ur" }
];
