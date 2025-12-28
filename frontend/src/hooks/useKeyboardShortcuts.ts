import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
  global?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[], enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Ctrl/Cmd shortcuts even in input fields
        if (!event.ctrlKey && !event.metaKey) {
          return;
        }
      }

      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrlKey ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          altMatch &&
          shiftMatch
        ) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

export const useGlobalShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'd',
      action: () => navigate('/dashboard'),
      description: 'Go to Dashboard',
      global: true,
    },
    {
      key: 'w',
      action: () => navigate('/dashboard/workflows'),
      description: 'Go to Workflows',
      global: true,
    },
    {
      key: 'e',
      action: () => navigate('/dashboard/executions'),
      description: 'Go to Executions',
      global: true,
    },
    {
      key: 's',
      action: () => navigate('/dashboard/schedules'),
      description: 'Go to Schedules',
      global: true,
    },
    {
      key: 'n',
      action: () => {
        if (location.pathname.includes('/workflows')) {
          navigate('/dashboard/workflows/new');
        }
      },
      description: 'New Workflow (on Workflows page)',
      global: true,
    },
  ];

  useKeyboardShortcuts(shortcuts, true);

  return shortcuts;
};
