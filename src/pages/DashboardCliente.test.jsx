import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardCliente from '../src/pages/DashboardCliente';
import { ChatContext } from '../src/contexts/ChatContext';
import { TabContext } from '../src/contexts/TabContext';
import { ProgressContext } from '../src/contexts/ProgressContext';
import * as firebase from 'firebase/firestore';
import * as messaging from '@react-native-firebase/messaging';

// Mock Firebase and React Native Firebase Messaging
jest.mock('firebase/firestore');
jest.mock('@react-native-firebase/messaging');

// Mock Contexts
const mockChatContext = {
  chatHistory: [],
  setChatHistory: jest.fn(),
  sendMessage: jest.fn(),
  isLoading: false,
  error: null,
};

const mockTabContext = {
  activeTab: 'perfil',
  setActiveTab: jest.fn(),
};

const mockProgressContext = {
  progressData: [],
  addProgress: jest.fn(),
  removeProgress: jest.fn(),
  fetchProgress: jest.fn(),
  isLoadingProgress: false,
  errorProgress: null,
};

const renderWithContexts = (component) => {
  return render(
    <TabContext.Provider value={mockTabContext}>
      <ChatContext.Provider value={mockChatContext}>
        <ProgressContext.Provider value={mockProgressContext}>
          {component}
        </ProgressContext.Provider>
      </ChatContext.Provider>
    </TabContext.Provider>
  );
};

describe('DashboardCliente', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getDocs to return an empty array initially
    firebase.getDocs.mockResolvedValue({
      docs: []
    });
    // Mock messaging permission request
    messaging.default.requestPermission.mockResolvedValue(1); // AUTHORIZED
    messaging.default.getToken.mockResolvedValue('dummy-token');
    messaging.default.onMessage.mockReturnValue(() => {});
    messaging.default.onNotificationOpenedApp.mockReturnValue(() => {});
    messaging.default.getInitialNotification.mockResolvedValue(null);

  });

  test('renders without crashing', () => {
    renderWithContexts(<DashboardCliente />);
    expect(screen.getByText('Bem-vindo de volta!')).toBeInTheDocument();
  });

  test('renders the Sidebar component', () => {
    renderWithContexts(<DashboardCliente />);
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // Assuming Sidebar is a nav element
  });

  test('renders the Tabs component', () => {
    renderWithContexts(<DashboardCliente />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  test('displays "Perfil" tab by default', () => {
    renderWithContexts(<DashboardCliente />);
    expect(screen.getByRole('tab', {
      name: 'Perfil'
    })).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Informações do Perfil')).toBeInTheDocument();
  });

  test('switches to "Treinos" tab on click', () => {
    renderWithContexts(<DashboardCliente />);
    const treinosTab = screen.getByRole('tab', {
      name: 'Treinos'
    });
    fireEvent.click(treinosTab);
    expect(treinosTab).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Plano de Treino')).toBeInTheDocument();
  });

  test('switches to "Progresso" tab on click', () => {
    renderWithContexts(<DashboardCliente />);
    const progressoTab = screen.getByRole('tab', {
      name: 'Progresso'
    });
    fireEvent.click(progressoTab);
    expect(progressoTab).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Acompanhamento de Progresso')).toBeInTheDocument();
  });

  test('switches to "Chat" tab on click', () => {
    renderWithContexts(<DashboardCliente />);
    const chatTab = screen.getByRole('tab', {
      name: 'Chat'
    });
    fireEvent.click(chatTab);
    expect(chatTab).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Chat com o Treinador')).toBeInTheDocument();
  });

  test('fetches chat history on tab change to "chat"', async () => {
    const mockChatMessages = [{
      id: '1',
      data: () => ({
        text: 'Hello',
        sender: 'user',
        timestamp: firebase.serverTimestamp()
      })
    }, {
      id: '2',
      data: () => ({
        text: 'Hi there',
        sender: 'trainer',
        timestamp: firebase.serverTimestamp()
      })
    }, ];
    firebase.getDocs.mockResolvedValue({
      docs: mockChatMessages
    });

    renderWithContexts(<DashboardCliente />);
    const chatTab = screen.getByRole('tab', {
      name: 'Chat'
    });
    fireEvent.click(chatTab);

    expect(firebase.collection).toHaveBeenCalledWith(firebase.getFirestore(), 'chat');
    expect(firebase.query).toHaveBeenCalled();
    expect(firebase.orderBy).toHaveBeenCalledWith('timestamp');
    expect(firebase.getDocs).toHaveBeenCalled();
    // Expect the chat history to be updated in the context (difficult to test directly without deeply inspecting context state changes)
    // A better approach might be to test the rendering of chat messages based on context state.
  });

  test('sends a message when the send button is clicked', async () => {
    renderWithContexts(<DashboardCliente />);
    const chatTab = screen.getByRole('tab', {
      name: 'Chat'
    });
    fireEvent.click(chatTab);

    const chatInput = screen.getByPlaceholderText('Digite sua mensagem...');
    fireEvent.change(chatInput, {
      target: {
        value: 'Test message'
      }
    });
    const sendButton = screen.getByRole('button', {
      name: 'Enviar'
    });
    fireEvent.click(sendButton);

    expect(mockChatContext.sendMessage).toHaveBeenCalledWith('Test message');
    expect(chatInput).toHaveValue(''); // Input should be cleared after sending
  });

  test('adds progress entry when form is submitted', async () => {
    renderWithContexts(<DashboardCliente />);
    const progressoTab = screen.getByRole('tab', {
      name: 'Progresso'
    });
    fireEvent.click(progressoTab);

    const weightInput = screen.getByPlaceholderText('Peso (kg)');
    const repsInput = screen.getByPlaceholderText('Repetições');
    const notesInput = screen.getByPlaceholderText('Anotações');
    const addButton = screen.getByRole('button', {
      name: 'Adicionar Progresso'
    });

    fireEvent.change(weightInput, {
      target: {
        value: '75'
      }
    });
    fireEvent.change(repsInput, {
      target: {
        value: '10'
      }
    });
    fireEvent.change(notesInput, {
      target: {
        value: 'Feeling good'
      }
    });
    fireEvent.click(addButton);

    expect(mockProgressContext.addProgress).toHaveBeenCalledWith({
      weight: '75',
      reps: '10',
      notes: 'Feeling good',
    });
    expect(weightInput).toHaveValue('');
    expect(repsInput).toHaveValue('');
    expect(notesInput).toHaveValue('');
  });

  test('calls removeProgress when delete button is clicked on a progress entry', async () => {
    const mockProgressEntries = [{
      id: 'progress-1',
      data: () => ({
        weight: '70',
        reps: '12',
        notes: 'Test entry',
        timestamp: firebase.serverTimestamp()
      })
    }];
    firebase.getDocs.mockResolvedValue({
      docs: mockProgressEntries
    });

    renderWithContexts(<DashboardCliente />);
    const progressoTab = screen.getByRole('tab', {
      name: 'Progresso'
    });
    fireEvent.click(progressoTab);

    // Assuming the progress entries are rendered and have a delete button
    // You might need to add data-testid or a more specific selector if the button is not easily identifiable
    // For now, let's assume a button with the text "Remover" or similar exists within the rendered entry.
    // This part might need adjustment based on the actual rendering of progress entries.
    const deleteButton = await screen.findByRole('button', {
      name: /remover/i
    });
    fireEvent.click(deleteButton);

    expect(mockProgressContext.removeProgress).toHaveBeenCalledWith('progress-1');
  });


  // Test for theme toggle (assuming the toggle exists and functions)
  test('toggles theme when theme button is clicked', () => {
    renderWithContexts(<DashboardCliente />);
    const themeButton = screen.getByRole('button', {
      name: /Alternar tema/i
    }); // Assuming button has an accessible name

    // Initial theme check (requires access to the theme state, which is not directly exposed)
    // You might need to test for a class change on the body or a specific element.
    // For example, check if 'dark' class is added/removed from the body.
    const body = document.body;
    const initialTheme = body.classList.contains('dark') ? 'dark' : 'light';

    fireEvent.click(themeButton);
    const themeAfterClick = body.classList.contains('dark') ? 'dark' : 'light';
    expect(themeAfterClick).not.toBe(initialTheme);

    fireEvent.click(themeButton);
    const themeAfterSecondClick = body.classList.contains('dark') ? 'dark' : 'light';
    expect(themeAfterSecondClick).toBe(initialTheme);
  });

  // Test for Firebase Messaging setup (checking if permissions are requested and token is obtained)
  test('requests notification permission and gets token on mount', async () => {
    renderWithContexts(<DashboardCliente />);
    expect(messaging.default.requestPermission).toHaveBeenCalled();
    expect(messaging.default.getToken).toHaveBeenCalled();
    expect(messaging.default.onMessage).toHaveBeenCalled();
    expect(messaging.default.onNotificationOpenedApp).toHaveBeenCalled();
    expect(messaging.default.getInitialNotification).toHaveBeenCalled();
  });

  // Test for handling incoming messages via Firebase Messaging
  test('handles incoming push notifications', async () => {
    const mockNotification = {
      notification: {
        title: 'New Message',
        body: 'You have a new message'
      },
      data: {
        // custom data
      },
    };

    // Mock the onMessage callback
    let onMessageCallback = null;
    messaging.default.onMessage.mockImplementation(callback => {
      onMessageCallback = callback;
      return () => {}; // Return an unsubscribe function
    });

    renderWithContexts(<DashboardCliente />);

    // Simulate receiving a message
    if (onMessageCallback) {
      onMessageCallback(mockNotification);
    }

    // Check if an alert was shown.
    // Note: React Native Alert is typically mocked in Jest.
    // Assuming Alert.alert is being called with the notification details.
    // You would need to mock Alert.alert and check if it was called.
    // Example mock:
    // jest.mock('react-native', () => ({
    //   Alert: {
    //     alert: jest.fn(),
    //   },
    // }));
    // Then check: expect(Alert.alert).toHaveBeenCalledWith(mockNotification.notification.title, mockNotification.notification.body);
  });

  // Test for handling opened notifications via Firebase Messaging
  test('handles opened push notifications', async () => {
    const mockNotification = {
      notification: {
        title: 'Opened Message',
        body: 'This message was opened'
      },
      data: {
        // custom data
      },
    };

    // Mock the onNotificationOpenedApp callback
    let onNotificationOpenedAppCallback = null;
    messaging.default.onNotificationOpenedApp.mockImplementation(callback => {
      onNotificationOpenedAppCallback = callback;
      return () => {}; // Return an unsubscribe function
    });

    renderWithContexts(<DashboardCliente />);

    // Simulate opening a notification
    if (onNotificationOpenedAppCallback) {
      onNotificationOpenedAppCallback(mockNotification);
    }

    // Check if the app navigated or performed an action based on the notification.
    // This depends on the implementation within the onNotificationOpenedApp listener.
    // For example, if it changes the active tab:
    // expect(mockTabContext.setActiveTab).toHaveBeenCalledWith('chat'); // Assuming opening notification goes to chat tab
  });

  // Test for handling initial notification when the app is opened from a killed state
  test('handles initial notification when app is opened from killed state', async () => {
    const mockInitialNotification = {
      notification: {
        title: 'Initial Message',
        body: 'App opened from this message'
      },
      data: {
        // custom data
      },
    };
    messaging.default.getInitialNotification.mockResolvedValue(mockInitialNotification);

    renderWithContexts(<DashboardCliente />);

    // Check if the app navigated or performed an action based on the initial notification.
    // This depends on the implementation within the getInitialNotification handling.
    // For example, if it changes the active tab:
    // await screen.findByText('Chat com o Treinador'); // Wait for the chat tab content to appear
    // expect(mockTabContext.setActiveTab).toHaveBeenCalledWith('chat'); // Assuming initial notification goes to chat tab
  });

});