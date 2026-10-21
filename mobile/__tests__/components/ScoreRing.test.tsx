import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ScoreRing, scoreTone } from '../../src/components/ScoreRing';
import { darkTheme } from '../../src/theme/themes';
import { AppProviders } from '../../test-utils/AppProviders';

describe('ScoreRing', () => {
  it('shows the score and reads it out for screen readers', async () => {
    await render(<ScoreRing score={94} />, { wrapper: AppProviders });

    expect(screen.getByText('94')).toBeTruthy();
    expect(screen.getByLabelText('Match score 94 out of 100')).toBeTruthy();
  });

  it('rounds and clamps scores into 0 to 100', async () => {
    await render(
      <>
        <ScoreRing score={87.6} />
        <ScoreRing score={140} />
        <ScoreRing score={-5} />
      </>,
      { wrapper: AppProviders }
    );

    expect(screen.getByText('88')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('uses gold for great matches and quieter tones below that', () => {
    const { colors } = darkTheme;

    expect(scoreTone(darkTheme, 92)).toBe(colors.scoreHigh);
    expect(scoreTone(darkTheme, 88)).toBe(colors.scoreHigh);
    expect(scoreTone(darkTheme, 75)).toBe(colors.scoreMid);
    expect(scoreTone(darkTheme, 58)).toBe(colors.scoreLow);
  });
});
