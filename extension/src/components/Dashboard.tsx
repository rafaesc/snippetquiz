import { useQuery } from '@tanstack/react-query';
import { apiService } from '../lib/api-service';
import chromeStorage from '../lib/chrome-storage';
import BankSelector from './BankSelector';
import { SavedContentList } from './SavedContentList';
import { useState, useEffect } from 'react';

function Dashboard() {
    const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

    // Check authentication status
    const { data: userProfile } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            try {
                const profile = await apiService.getUserProfile();
                await chromeStorage.local.set({ userId: profile.id });
                return profile;
            } catch (error) {
                await chromeStorage.local.clear();
                console.log('Chrome storage cleared due to profile fetch failure:', error);
            }
        },
        retry: false,
    });
    const banks = userProfile?.banks;

    // Initialize selected bank from storage or default to first bank
    useEffect(() => {
        const initializeBankSelection = async () => {
            if (banks && banks.length > 0) {
                try {
                    // Try to get stored bank ID
                    const storage = await chromeStorage.local.get<{ selectedBankId?: string }>(['selectedBankId']);

                    if (storage.selectedBankId && banks.find(bank => bank.id === storage.selectedBankId)) {
                        // Use stored bank ID if it exists and is valid
                        setSelectedBankId(storage.selectedBankId);
                    } else {
                        // Default to first bank
                        const defaultBankId = banks[0].id;
                        console.log("demooo", defaultBankId)
                        setSelectedBankId(defaultBankId);
                        await chromeStorage.local.set({ selectedBankId: defaultBankId });
                    }
                } catch (error) {
                    console.error('Error initializing bank selection:', error);
                    // Fallback to first bank
                    const defaultBankId = banks[0].id;
                    setSelectedBankId(defaultBankId);
                    await chromeStorage.local.set({ selectedBankId: defaultBankId });
                }
            }
        };

        initializeBankSelection();
    }, [banks]);

    return (
        <div className="max-h-96 overflow-y-auto">

            <div className="p-4 border-b border-border">
                {/* Bank Selection Component */}
                {userProfile?.banks && (
                    <BankSelector
                        banks={userProfile.banks}
                        selectedBankId={selectedBankId!}
                        onBankChange={setSelectedBankId}
                        className="mb-6"
                    />
                )}

            </div>
            <div className="p-4 border-b border-border">
                {selectedBankId && <SavedContentList selectedBankId={selectedBankId!} />}
            </div>
        </div>
    );
}

export default Dashboard;