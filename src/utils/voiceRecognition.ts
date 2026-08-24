// Web Speech API Voice Recognition for Zero-Friction Hydration Logging

export interface ParsedVoiceIntake {
  amount: number;
  beverageType: 'water' | 'electrolyte' | 'tea' | 'coffee' | 'juice' | 'soda' | 'milk' | 'alcohol';
  containerName: string;
  confidence: number;
  rawTranscript: string;
}

// Parse conversational voice commands (e.g. "log 300 ml water", "drank a cup of coffee", "500 ml electrolyte", "a glass of chai")
export const parseVoiceHydrationCommand = (transcript: string): ParsedVoiceIntake | null => {
  const text = transcript.toLowerCase().trim();

  // 1. Detect Beverage
  let beverageType: ParsedVoiceIntake['beverageType'] = 'water';
  let containerName = 'Voice Log';

  if (text.includes('coffee') || text.includes('espresso') || text.includes('cappuccino') || text.includes('latte')) {
    beverageType = 'coffee';
    containerName = 'Coffee';
  } else if (text.includes('tea') || text.includes('chai') || text.includes('green tea') || text.includes('herbal')) {
    beverageType = 'tea';
    containerName = 'Tea / Chai';
  } else if (text.includes('electrolyte') || text.includes('ors') || text.includes('sports drink') || text.includes('gatorade')) {
    beverageType = 'electrolyte';
    containerName = 'Electrolytes / ORS';
  } else if (text.includes('coconut water')) {
    beverageType = 'electrolyte';
    containerName = 'Coconut Water';
  } else if (text.includes('milk') || text.includes('shake') || text.includes('smoothie')) {
    beverageType = 'milk';
    containerName = 'Milk / Shake';
  } else if (text.includes('juice') || text.includes('orange') || text.includes('lemon') || text.includes('nimbu')) {
    beverageType = 'juice';
    containerName = 'Fresh Juice';
  } else if (text.includes('beer') || text.includes('wine') || text.includes('alcohol') || text.includes('cocktail')) {
    beverageType = 'alcohol';
    containerName = 'Alcohol';
  } else if (text.includes('soda') || text.includes('coke') || text.includes('pepsi') || text.includes('energy drink')) {
    beverageType = 'soda';
    containerName = 'Soda';
  } else {
    beverageType = 'water';
    containerName = 'Water';
  }

  // 2. Extract Amount (ml or cups/glasses)
  let amount = 250; // default glass

  const numberMatches = text.match(/\d+/g);
  if (numberMatches && numberMatches.length > 0) {
    const parsedNum = parseInt(numberMatches[0], 10);
    // If user says "1 glass" or "2 bottles"
    if (parsedNum <= 5 && (text.includes('glass') || text.includes('cup') || text.includes('bottle'))) {
      if (text.includes('bottle')) amount = parsedNum * 600;
      else if (text.includes('cup')) amount = parsedNum * 200;
      else amount = parsedNum * 250;
    } else if (parsedNum >= 10 && parsedNum <= 3000) {
      amount = parsedNum;
    }
  } else {
    // Word multipliers
    if (text.includes('bottle')) amount = 750;
    else if (text.includes('flask') || text.includes('shaker')) amount = 600;
    else if (text.includes('mug')) amount = 350;
    else if (text.includes('cup') || text.includes('espresso')) amount = 200;
    else if (text.includes('jug')) amount = 1000;
    else if (text.includes('sip')) amount = 100;
    else amount = 250;
  }

  return {
    amount,
    beverageType,
    containerName,
    confidence: 0.95,
    rawTranscript: transcript,
  };
};

export class VoiceHydrationRecognizer {
  private recognition: any = null;
  public isSupported: boolean = false;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.isSupported = true;
    }
  }

  public listen(
    onResult: (result: ParsedVoiceIntake) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const parsed = parseVoiceHydrationCommand(transcript);
      if (parsed) {
        onResult(parsed);
      } else {
        onError(`Could not parse hydration command from: "${transcript}"`);
      }
    };

    this.recognition.onerror = (event: any) => {
      onError(`Speech recognition error: ${event.error}`);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      onError(e.message || 'Microphone error');
    }
  }

  public stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }
}

export const voiceRecognizer = new VoiceHydrationRecognizer();
