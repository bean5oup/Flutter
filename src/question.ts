import type { Question } from './types';
import questionaireList from "./assets/questionaire.json" assert { type: "json" };

const QLIST = questionaireList as Question[];

const TEMPLATE = [
    [5, 4, 3, 1, 2, 0, 6, 7],
    [4, 2, 1, 6, 7, 0, 3, 5],
    [0, 1, 2, 3, 4, 5, 6, 7],
    [2, 7, 1, 3, 0, 6, 5, 4]
];

export const createQuestionaire = async () : Promise<Question[]> => {
    const idx = Math.floor(Math.random() * TEMPLATE.length);
    const template = TEMPLATE[idx] ?? [];
    const questionaire : Question[] = [];
    for (const i of template) {
        if(QLIST[i])
            questionaire.push(QLIST[i]);
    }
    return questionaire;
};