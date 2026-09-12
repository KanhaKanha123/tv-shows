import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ShowSkeleton from './ShowSkeleton.vue';

describe('ShowSkeleton', () => {
  it('renders card skeletons by default', () => {
    const wrapper = mount(ShowSkeleton);

    expect(wrapper.find('.skeleton-grid').exists()).toBe(true);

    expect(wrapper.find('.skeleton-list').exists()).toBe(false);
  });

  it('renders the default number of card skeletons', () => {
    const wrapper = mount(ShowSkeleton);

    expect(wrapper.findAll('.skeleton-card')).toHaveLength(6);
  });

  it('renders the provided number of card skeletons', () => {
    const wrapper = mount(ShowSkeleton, {
      props: {
        count: 3,
      },
    });

    expect(wrapper.findAll('.skeleton-card')).toHaveLength(3);
  });

  it('renders the inline variant', () => {
    const wrapper = mount(ShowSkeleton, {
      props: {
        variant: 'inline',
      },
    });

    expect(wrapper.find('.skeleton-list').exists()).toBe(true);

    expect(wrapper.find('.skeleton-grid').exists()).toBe(false);
  });

  it('renders the provided number of inline skeletons', () => {
    const wrapper = mount(ShowSkeleton, {
      props: {
        variant: 'inline',
        count: 4,
      },
    });

    expect(wrapper.findAll('.skeleton-item')).toHaveLength(4);
  });

  it('adds an accessible loading label for the card variant', () => {
    const wrapper = mount(ShowSkeleton);

    const grid = wrapper.get('.skeleton-grid');

    expect(grid.attributes('role')).toBe('status');

    expect(grid.attributes('aria-label')).toBe('Loading shows');
  });

  it('adds an accessible loading label for the inline variant', () => {
    const wrapper = mount(ShowSkeleton, {
      props: {
        variant: 'inline',
      },
    });

    const list = wrapper.get('.skeleton-list');

    expect(list.attributes('role')).toBe('status');

    expect(list.attributes('aria-label')).toBe('Loading content');
  });

  it('marks card skeleton content as decorative', () => {
    const wrapper = mount(ShowSkeleton, {
      props: {
        count: 2,
      },
    });

    const cards = wrapper.findAll('.skeleton-card');

    expect(cards).toHaveLength(2);

    for (const card of cards) {
      expect(card.attributes('aria-hidden')).toBe('true');
    }
  });

  it('marks inline skeleton content as decorative', () => {
    const wrapper = mount(ShowSkeleton, {
      props: {
        variant: 'inline',
        count: 2,
      },
    });

    const items = wrapper.findAll('.skeleton-item');

    expect(items).toHaveLength(2);

    for (const item of items) {
      expect(item.attributes('aria-hidden')).toBe('true');
    }
  });
});
