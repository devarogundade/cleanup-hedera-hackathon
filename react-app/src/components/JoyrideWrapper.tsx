import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.trash-site-visualization',
    content: 'Click on any fraction to select it for donation. Each fraction represents a portion of the trash site.',
    disableBeacon: true,
  },
  {
    target: '.donation-panel',
    content: 'View your selected fractions and total donation amount here.',
  },
  {
    target: '.donate-button',
    content: 'Ready to make a difference? Click here to vote for an NGO and donate to receive your unique NFT!',
  },
  {
    target: '.transaction-history',
    content: 'Track all donations and withdrawals for this round. Use filters to find specific transactions.',
  },
];

const JoyrideWrapper = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status as typeof STATUS.FINISHED | typeof STATUS.SKIPPED)) {
      localStorage.setItem('hasSeenTour', 'true');
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(142 70% 42%)',
          zIndex: 10000,
        },
      }}
    />
  );
};

export default JoyrideWrapper;
