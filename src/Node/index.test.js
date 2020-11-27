import React from 'react';
import { shallow, mount } from 'enzyme';

import Node from './index.tsx';

describe('<Node />', () => {
  const data = {
    id: 'abc123',
    name: 'mockNode',
  };

  const mockProps = {
    data,
    nodeSize: {
      x: 123,
      y: 321,
    },
    position: {
      x: 111,
      y: 222,
    },
    depth: 3,
    nodeElement: {
      tag: 'circle',
      baseProps: {
        r: 10,
      },
    },
    attributes: {
      testkeyA: 'testvalA',
      testKeyB: 'testvalB',
    },
    orientation: 'horizontal',
    parent: {
      x: 999,
      y: 888,
    },
    transitionDuration: 500,
    onClick: () => {},
    onMouseOver: () => {},
    onMouseOut: () => {},
    subscriptions: {},
    allowForeignObjects: false,
  };

  jest.spyOn(Node.prototype, 'applyTransform');

  // Clear method spies on prototype after each test
  afterEach(() => jest.clearAllMocks());

  it('has the correct `id` attribute value', () => {
    const renderedComponent = shallow(<Node {...mockProps} />);

    expect(
      renderedComponent
        .find('g')
        .first()
        .prop('id')
    ).toBe(data.id);
  });

  it('applies correct base className if `data._children` is defined', () => {
    const leafNodeComponent = shallow(<Node {...mockProps} />);
    const nodeComponent = shallow(<Node {...mockProps} data={{ ...data, _children: [] }} />);

    expect(
      leafNodeComponent
        .find('g')
        .first()
        .prop('className')
    ).toBe('rd3t-leaf-node');
    expect(
      nodeComponent
        .find('g')
        .first()
        .prop('className')
    ).toBe('rd3t-node');
  });

  it('applies correct `transform` prop based on its `orientation`', () => {
    const horizontalTransform = `translate(${mockProps.parent.y},${mockProps.parent.x})`;
    const verticalTransform = `translate(${mockProps.parent.x},${mockProps.parent.y})`;
    const horizontalComponent = shallow(<Node {...mockProps} />);
    const verticalComponent = shallow(<Node {...mockProps} orientation="vertical" />);
    expect(
      horizontalComponent
        .find('g')
        .first()
        .prop('transform')
    ).toBe(horizontalTransform);
    expect(
      verticalComponent
        .find('g')
        .first()
        .prop('transform')
    ).toBe(verticalTransform);
  });

  describe('Events', () => {
    it('handles onClick events and passes its nodeId & event object to onClick handler', () => {
      const onClickSpy = jest.fn();
      const mockEvt = { mock: 'event' };
      const renderedComponent = shallow(<Node {...mockProps} onClick={onClickSpy} />);

      renderedComponent.simulate('click', mockEvt);
      expect(onClickSpy).toHaveBeenCalledTimes(1);
      expect(onClickSpy).toHaveBeenCalledWith(data.id, expect.objectContaining(mockEvt));
    });

    it('handles onMouseOver events and passes its nodeId & event object to onMouseOver handler', () => {
      const onMouseOverSpy = jest.fn();
      const mockEvt = { mock: 'event' };
      const renderedComponent = shallow(<Node {...mockProps} onMouseOver={onMouseOverSpy} />);

      renderedComponent.simulate('mouseover', mockEvt);
      expect(onMouseOverSpy).toHaveBeenCalledTimes(1);
      expect(onMouseOverSpy).toHaveBeenCalledWith(data.id, expect.objectContaining(mockEvt));
    });

    it('handles onMouseOut events and passes its nodeId & event object to onMouseOut handler', () => {
      const onMouseOutSpy = jest.fn();
      const mockEvt = { mock: 'event' };
      const renderedComponent = shallow(<Node {...mockProps} onMouseOut={onMouseOutSpy} />);

      renderedComponent.simulate('mouseout', mockEvt);
      expect(onMouseOutSpy).toHaveBeenCalledTimes(1);
      expect(onMouseOutSpy).toHaveBeenCalledWith(data.id, expect.objectContaining(mockEvt));
    });
  });

  it('applies its own x/y coords on `transform` once mounted', () => {
    const fixture = `translate(${mockProps.position.y},${mockProps.position.x})`;
    const renderedComponent = mount(<Node {...mockProps} />);

    expect(renderedComponent.instance().applyTransform).toHaveBeenCalledWith(
      fixture,
      mockProps.transitionDuration
    );
  });

  describe('Update Positioning', () => {
    it('updates its position if `data.x` or `data.y` changes', () => {
      const updatedProps = {
        ...mockProps,
        x: 1,
        y: 2,
        data: {
          ...mockProps.data,
        },
      };
      const initialTransform = `translate(${mockProps.position.y},${mockProps.position.x})`;
      const updatedTransform = `translate(${updatedProps.position.y},${updatedProps.position.x})`;
      const renderedComponent = mount(<Node {...mockProps} />);

      expect(renderedComponent.instance().applyTransform).toHaveBeenCalledWith(
        initialTransform,
        mockProps.transitionDuration
      );

      renderedComponent.setProps(updatedProps);

      expect(renderedComponent.instance().applyTransform).toHaveBeenCalledWith(
        updatedTransform,
        mockProps.transitionDuration
      );
    });

    it('updates its position if `orientation` changes', () => {
      const thisProps = { ...mockProps, shouldTranslateToOrigin: true, orientation: 'horizontal' };
      delete thisProps.parent;
      const renderedComponent = mount(<Node {...thisProps} />);
      const nextProps = { ...thisProps, orientation: 'vertical' };
      expect(
        renderedComponent.instance().shouldNodeTransform(renderedComponent.props(), nextProps)
      ).toBe(true);
    });

    it('updates its position if any subscribed top-level props change', () => {
      const subscriptions = { x: 12, y: 10, initialDepth: undefined };
      const renderedComponent = mount(<Node {...mockProps} subscriptions={subscriptions} />);
      const nextProps = { ...mockProps, subscriptions: { ...subscriptions, initialDepth: 1 } };

      expect(
        renderedComponent.instance().shouldNodeTransform(renderedComponent.props(), nextProps)
      ).toBe(true);
    });
  });
});
