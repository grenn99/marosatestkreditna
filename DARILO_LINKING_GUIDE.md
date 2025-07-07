# Linking to Darilo Packages

This guide explains how to create links to specific gift packages in the Darilo (Gift) feature.

## Linking to Darilo Package ID 14

### Simple URL Method

The simplest way to link to Darilo package ID 14 is to use the following URL:

```
/darilo?packageId=14
```

When a user visits this URL, they will be automatically redirected to the gift builder page for package ID 14.

### With Language Parameter

To include a language parameter:

```
/darilo?packageId=14&lang=en
```

Replace `en` with the desired language code (`sl`, `de`, `hr`, etc.).

### Direct Link to Gift Builder

You can also link directly to the gift builder page:

```
/darilo/builder/14
```

With language parameter:

```
/darilo/builder/14?lang=en
```

## Using the React Components

### DariloPackageLink Component

For React components, use the `DariloPackageLink` component:

```jsx
import { DariloPackageLink } from './components/DariloPackageLink';

// In your component:
<DariloPackageLink 
  packageId={14} 
  buttonText="View Gift Package 14" 
/>
```

### Using Utility Functions

You can also use the utility functions:

```jsx
import { createDariloPackageLink, createGiftBuilderLink } from './utils/linkUtils';
import { Link } from 'react-router-dom';

// In your component:
const linkUrl = createDariloPackageLink(14, 'en');

<Link to={linkUrl}>View Gift Package 14</Link>
```

## HTML Usage

For HTML or non-React contexts:

```html
<a href="/darilo?packageId=14">View Gift Package 14</a>
```

With language parameter:

```html
<a href="/darilo?packageId=14&lang=en">View Gift Package 14</a>
```

## Implementation Details

The implementation works by:

1. Adding a URL parameter handler to the `DariloProductPage` component
2. When a `packageId` parameter is detected, automatically redirecting to the gift builder page
3. Providing utility functions and components to make linking easier

This approach maintains clean URLs and provides a good user experience.
