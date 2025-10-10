import { useEffect, useState } from 'react';
import { useAccount, useSignTypedData, useChainId } from 'wagmi';
import { optimism, optimismSepolia } from 'viem/chains';
import { DOMAIN, TYPES } from '../constants/contracts';

type Question = {
    id: number;
    question: string; // e.g., "Q1: How often do you exercise?"
    options: string[]; // e.g., ["Daily", "3-5 times/week", ...]
};

type QuestionsResponse = {
    questionaireList: Question[];
};

type SubmitPayload = {
    chainId: string;
    account: string;
    answers: Record<string, string>;
    signature: string;
    timestamp: string;
};

type SubmitResponse = {
    success: boolean;
    tx: string;
    error?: string;
};

const chains = [optimism, optimismSepolia]

export function Questionaire() {
    const { address } = useAccount();
    const chainId = useChainId();
    const { signTypedDataAsync, isPending: isSigningPending } = useSignTypedData();
    
    const [questions, setQuestions] = useState<Question[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    // const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
    const [tx, setTx] = useState<string>();

    // const nowIso = useMemo(() => new Date().toISOString(), []);

    useEffect(() => {
        let isCancelled = false;
        async function fetchQuestions() {
            setLoading(true);
            // setError(null);
            try {
                const payload = {
                    'account': address
                };

                const res = await fetch('/api/question', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch questions (${res.status})`);
                }

                const data: QuestionsResponse = await res.json();
                if (!isCancelled) {
                    setQuestions(data?.questionaireList ?? []);
                }
            } catch (err: any) {
                if (!isCancelled) {
                    // On any error, use fallback questions
                    // setError(err?.message ?? 'Unknown error');
                }
            } finally {
                if (!isCancelled) setLoading(false);
            }
        }
        fetchQuestions();
        return () => {
            isCancelled = true;
        };
    }, [address]);

    function handleSelect(questionId: string, value: string) {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    }

    function validateAnswers(): { isValid: boolean; unansweredQuestions: number[] } {
        if (!questions) return { isValid: false, unansweredQuestions: [] };

        const unansweredQuestions: number[] = [];
        questions.forEach(q => {
            if (!answers[q.id.toString()] || answers[q.id.toString()].trim() === '') {
                unansweredQuestions.push(q.id);
            }
        });

        return {
            isValid: unansweredQuestions.length === 0,
            unansweredQuestions
        };
    }

    async function handleSubmit() {
        if (!address) {
            alert('Wallet address not available');
            return;
        }

        const validation = validateAnswers();
        if (!validation.isValid) {
            alert(`Please answer all questions: ${validation.unansweredQuestions.join(', ')}`);
            return;
        }

        setSubmitting(true);
        setSubmitSuccess(false);
        setTx('');

        try {
            const timestamp = new Date().getTime();
            // Prepare the message for EIP-712 signing
            const message = {
                answer: JSON.stringify(answers),
                timestamp: BigInt(timestamp)
            };

            // Sign the typed data
            const signature = await signTypedDataAsync({
                domain: DOMAIN(BigInt(chainId)),
                types: TYPES,
                primaryType: 'Questionnaire',
                message,
            });

            // Submit to backend with signature
            const payload: SubmitPayload = {
                chainId: chainId.toString(),
                account: address,
                answers,
                signature,
                timestamp: timestamp.toString()
            };

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data: SubmitResponse = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Signature verification failed');
            }

            setSubmitSuccess(true);
            setTx(data.tx);

            // Optionally reset answers after successful submission
            setAnswers({});
        } catch (err: any) {
            alert(err?.message ?? 'Failed to submit answers');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <h2>📝 Questionnaire</h2>
            {loading && (
                <div>
                    <p>Loading questions...</p>
                </div>
            )}
            <div>
                {questions?.map((q) => (
                    <div key={q.id.toString()}>
                        <h4>{q.id.toString()}: {q.question}</h4>
                        <div className="flex justify-center">
                            {(q.options || []).map(option => (
                                <label key={option} className="items-center">
                                    <input
                                        type="radio"
                                        name={q.id.toString()}
                                        value={option}
                                        checked={answers[q.id] === option}
                                        onChange={(e) => handleSelect(q.id.toString(), e.target.value)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit Section */}
            <div className="mt-8">
                {submitSuccess && (
                    <div>
                        <div>
                            ✅ Answers submitted successfully!
                        </div>
                        <a href={`https://sepolia-optimism.etherscan.io/tx/${tx}`}>
                            tx: {tx}
                        </a>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting || isSigningPending || !questions || questions.length === 0}
                >
                    {submitting || isSigningPending ? 'Signing & Submitting...' : 'Submit Answers'}
                </button>
            </div>
        </div>
    );
}