# OnTrack - Habit Tracker App

A cross-platform habit tracking app built with React Native and Expo. Track your goals, log entries with customizable quick-add options, and monitor your progress over time.

## Features

- **Multiple Goals**: Create and manage multiple independent goals and habits
- **Customizable Options**: Define quick-add buttons with custom labels and values for each goal (e.g., "Glass S" = 250ml, "Glass L" = 500ml)
- **Entry History**: View chronological history of all logged entries with timestamps
- **Target Setting**: Set optional targets per goal (e.g., 2 liters per day)
- **Edit & Delete**: Modify or remove entries and goals as needed
- **Dark/Light/System Theme**: Choose your preferred appearance or follow system settings
- **Multi-language Support**: Available in 12 languages (English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Japanese, Simplified Chinese, Traditional Chinese, Hindi)
- **Cross-platform**: Works on iOS, Android, and Web
- **Local Data Persistence**: All data stored locally on device
- **Demo Mode**: Try the app instantly with sample data

## Future Improvements

- **RTL (Right-to-Left) Support**: Add support for RTL languages like Arabic and Hebrew
- **Lazy Loading for Large Lists**: Optimize performance for users with extensive entry histories
- **Landscape Orientation Support**: Improve layout and usability in landscape mode on mobile devices

## Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app for Expo Go (fast)

```bash
npx expo start -c
```

In the output, you'll find options to open the app in a
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
- Your browser → http://localhost:8081

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

### 3. Build the app (slow)

[Development build documentation](https://docs.expo.dev/develop/development-builds/introduction/)

#### 3.1. iOS

```bash
npm run ios
```

#### 3.2 Android

```bash
npm run android
```

#### 3.3 Web

```bash
npm run web
```

This starts the Expo dev server and opens the app in your browser at http://localhost:8081.

## Deploy

### iOS

// TODO

### Android

// TODO

### Web

```bash
npx expo export -p web
npm run deploy
```

To test the bundle before deploying it, run:
```bash
npx serve dist
```

## Testing

### Overview

This project uses **Jest** with **React Native Testing Library** for unit testing. Tests are focused on business logic, data operations, and component behavior.

### What We Test

✅ **DO Test:**
- Business logic (pure functions, calculations, validations)
- Data operations (storage, transformations)
- Component logic (state changes, event handlers, conditional rendering)
- Custom hooks
- Error handling and edge cases

❌ **DON'T Unit Test:**
- Visual appearance (use snapshot tests or visual regression tools)
- Layout/styling (not typically unit tested)
- Complex navigation flows (use E2E tests like Detox)
- Native modules (mock them instead)

### Test File Structure

Tests follow this convention:
```
src/
  services/
    storage.ts
    __tests__/
      storage.test.ts    ← Test file goes in __tests__ folder
```

### Example Test Walkthrough

Let's break down the storage.test.ts example:

#### 1. Setup and Mocking

```typescript
// Mock AsyncStorage to prevent real storage operations
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));
```

**Why?** Unit tests should be fast and isolated. We don't want to write to actual storage during tests.

#### 2. Test Structure (AAA Pattern)

Every test follows **Arrange, Act, Assert**:

```typescript
it('should return empty array when no habits exist', async () => {
  // ARRANGE - Set up test data and mocks
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

  // ACT - Execute the function being tested
  const result = await getHabits();

  // ASSERT - Verify the result
  expect(result).toEqual([]);
  expect(AsyncStorage.getItem).toHaveBeenCalledWith('habits');
});
```

#### 3. Testing Different Scenarios

**Happy Path:**
```typescript
it('should add new habit to existing habits', async () => {
  // Tests the normal, expected behavior
});
```

**Edge Cases:**
```typescript
it('should add habit to empty list', async () => {
  // Tests boundary conditions
});
```

**Error Cases:**
```typescript
it('should throw error when storage fails', async () => {
  // Tests error handling
  await expect(getHabits()).rejects.toThrow('Storage error');
});
```

#### 4. Common Jest Matchers

```typescript
// Equality
expect(result).toBe(5);                    // Exact equality (===)
expect(result).toEqual([1, 2, 3]);         // Deep equality (objects/arrays)

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();
expect(result).toBeNull();
expect(result).toBeUndefined();

// Numbers
expect(result).toBeGreaterThan(3);
expect(result).toBeLessThanOrEqual(10);

// Arrays
expect(result).toHaveLength(5);
expect(result).toContain('item');

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(3);

// Async/Errors
await expect(promise).resolves.toBe('value');
await expect(promise).rejects.toThrow('Error message');
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage

# Run a specific test file
npm test -- storage.test

# Run tests matching a pattern
npm test -- --testNamePattern="should add"
```

### Coverage Report

After running `npm test -- --coverage`, you'll see:

```
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
storage.ts|  100.00 |   100.00 |  100.00 |  100.00 |
```

**Goal:** Aim for 80%+ coverage on business-critical code.

### Best Practices

1. **Test behavior, not implementation**
   ```typescript
   // ❌ Bad - tests implementation details
   expect(habits[0].id).toBe('1');

   // ✅ Good - tests behavior
   const habit = await getHabitById('1');
   expect(habit.name).toBe('Exercise');
   ```

2. **Keep tests isolated**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks(); // Clean slate for each test
   });
   ```

3. **Use descriptive test names**
   ```typescript
   // ❌ Bad
   it('works', () => { ... });

   // ✅ Good
   it('should return entries sorted by timestamp descending', () => { ... });
   ```

4. **Test one thing per test**
   ```typescript
   // ❌ Bad - tests multiple behaviors
   it('should add, update, and delete habits', () => { ... });

   // ✅ Good - focused tests
   it('should add habit to storage', () => { ... });
   it('should update existing habit', () => { ... });
   it('should delete habit and clean up related data', () => { ... });
   ```

5. **Mock external dependencies**
   - AsyncStorage
   - API calls (fetch, axios)
   - Navigation
   - Native modules
   - Date/Time (for consistent timestamps)

### Testing Components

Example component test:
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { MyButton } from '../MyButton';

it('should call onPress when button is pressed', () => {
  const onPressMock = jest.fn();
  const { getByText } = render(<MyButton onPress={onPressMock} />);

  fireEvent.press(getByText('Click Me'));

  expect(onPressMock).toHaveBeenCalledTimes(1);
});
```

### Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useCounter } from '../useCounter';

it('should increment counter', () => {
  const { result } = renderHook(() => useCounter());

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

### Troubleshooting

**Error: Cannot find module**
- Make sure all dependencies are installed
- Check your jest.config.js transformIgnorePatterns

**Tests are slow**
- Check if you're making real network/storage calls (should be mocked)
- Use `jest.setTimeout(10000)` for slow async operations

**Async tests failing**
- Make sure to use `async/await` or return promises
- Check that mocks are returning resolved/rejected promises correctly

### Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## About Expo

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
