import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { AddItemModal } from '../../src/components/AddItemModal';
import { uploadItemApi, ApiError } from '../../src/api/client';
import { AppProviders } from '../../test-utils/AppProviders';

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));
jest.mock('../../src/api/client', () => {
  const actual = jest.requireActual('../../src/api/client');
  return { ApiError: actual.ApiError, uploadItemApi: jest.fn() };
});

const picker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockedUpload = uploadItemApi as jest.Mock;
const PICKED = { canceled: false, assets: [{ uri: 'file:///photo.jpg' }] };

async function renderModal(overrides: Partial<React.ComponentProps<typeof AddItemModal>> = {}) {
  const props = {
    visible: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    onLimitReached: jest.fn(),
    ...overrides,
  };
  await render(<AddItemModal {...props} />, { wrapper: AppProviders });
  return props;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  (picker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(PICKED);
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('AddItemModal', () => {
  it('opens the system photo picker without asking for photo library permission', async () => {
    await renderModal();

    await fireEvent.press(screen.getByText('Gallery'));

    await waitFor(() => expect(picker.launchImageLibraryAsync).toHaveBeenCalledTimes(1));
    expect(picker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  });

  it('still asks for camera permission before taking a photo', async () => {
    (picker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (picker.launchCameraAsync as jest.Mock).mockResolvedValue(PICKED);
    await renderModal();

    await fireEvent.press(screen.getByText('Take photo'));

    await waitFor(() => expect(picker.launchCameraAsync).toHaveBeenCalledTimes(1));
    expect(picker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('hands off to the limit sheet when the server says the closet is full', async () => {
    mockedUpload.mockRejectedValue(new ApiError('Free plan limit reached (30 items).', 402, true));
    const props = await renderModal();

    await fireEvent.press(screen.getByText('Gallery'));
    await screen.findByText('Change photo');
    await fireEvent.press(screen.getByText('T-Shirt'));
    await fireEvent.press(screen.getByRole('button', { name: 'Add to closet' }));

    await waitFor(() => expect(props.onLimitReached).toHaveBeenCalledTimes(1));
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(props.onSuccess).not.toHaveBeenCalled();
  });
});
