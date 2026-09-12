import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import App from './App.vue';

describe('App', () => {
  it('renders the router view', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: {
            template: `
              <div data-testid="router-view">
                Route content
              </div>
            `,
          },
        },
      },
    });

    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true);

    expect(wrapper.text()).toContain('Route content');
  });
});
