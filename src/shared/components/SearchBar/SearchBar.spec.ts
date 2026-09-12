import { mount } from '@vue/test-utils';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import SearchBar from './SearchBar.vue';

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('renders the search input', () => {
    const wrapper = mount(SearchBar);

    expect(wrapper.find('input[type="search"]').exists()).toBe(true);
  });

  it('renders the initial value', () => {
    const wrapper = mount(SearchBar, {
      props: {
        initialValue: 'The Wire',
      },
    });

    expect(wrapper.get('input').element.value).toBe('The Wire');
  });

  it('renders an empty input when initialValue is not provided', () => {
    const wrapper = mount(SearchBar);

    expect(wrapper.get('input').element.value).toBe('');
  });

  it('renders an accessible label for the search input', () => {
    const wrapper = mount(SearchBar);

    const label = wrapper.get('label');
    const input = wrapper.get('input');

    expect(label.text()).toBe('Search TV shows');
    expect(label.attributes('for')).toBe('show-search');
    expect(input.attributes('id')).toBe('show-search');
  });

  it('uses the expected placeholder', () => {
    const wrapper = mount(SearchBar);

    expect(wrapper.get('input').attributes('placeholder')).toBe('Search TV shows...');
  });

  it('disables autocomplete', () => {
    const wrapper = mount(SearchBar);

    expect(wrapper.get('input').attributes('autocomplete')).toBe('off');
  });

  it('marks the search icon as decorative', () => {
    const wrapper = mount(SearchBar);

    expect(wrapper.get('.search-bar-icon').attributes('aria-hidden')).toBe('true');
  });

  it('emits search with the entered value', async () => {
    const wrapper = mount(SearchBar);

    const input = wrapper.get('input');

    await input.setValue('Breaking Bad');

    // Advance timers to trigger debounced search (300ms)
    vi.advanceTimersByTime(300);

    expect(wrapper.emitted('search')).toBeTruthy();

    expect(wrapper.emitted('search')).toEqual([['Breaking Bad']]);
  });

  it('emits search when the input is cleared', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        initialValue: 'Breaking Bad',
      },
    });

    const input = wrapper.get('input');

    await input.setValue('');

    // Advance timers to trigger debounced search (300ms)
    vi.advanceTimersByTime(300);

    expect(wrapper.emitted('search')).toEqual([['']]);
  });

  it('updates the input value when the parent re-supplies initialValue', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        initialValue: 'Old value',
      },
    });

    await wrapper.setProps({ initialValue: 'New value' });

    expect(wrapper.get('input').element.value).toBe('New value');
  });

  it('shows a validation error for too-long queries without emitting a search event', async () => {
    const wrapper = mount(SearchBar);
    const input = wrapper.get('input');
    const longQuery = 'a'.repeat(151);

    input.element.value = longQuery;
    await input.trigger('input');
    vi.advanceTimersByTime(300);

    await wrapper.vm.$nextTick();

    expect(wrapper.get('#search-error').text()).toContain('Search must be 150 characters or fewer');
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true');
    expect(wrapper.emitted('search')).toBeUndefined();
  });

  it('clears the field and emits a blank search when the clear button is clicked', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        initialValue: 'Breaking Bad',
      },
    });

    const button = wrapper.get('button[aria-label="Clear search"]');
    await button.trigger('click');

    expect(wrapper.get('input').element.value).toBe('');
    expect(wrapper.emitted('search')).toEqual([['']]);
    expect(wrapper.find('#search-error').exists()).toBe(false);
  });
});
