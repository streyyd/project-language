export type AppRoute =
  | 'dashboard'
  | 'library'
  | 'add-words'
  | 'study'
  | 'progress'

export interface NavigationItem {
  route: AppRoute
  label: string
  description: string
  icon: 'grid' | 'book' | 'plus' | 'study' | 'progress'
}

export const navigationItems: NavigationItem[] = [
  {
    route: 'dashboard',
    label: 'Dashboard',
    description: 'Your learning overview',
    icon: 'grid',
  },
  {
    route: 'library',
    label: 'Library',
    description: 'Your vocabulary',
    icon: 'book',
  },
  {
    route: 'add-words',
    label: 'Add Words',
    description: 'Grow your vocabulary',
    icon: 'plus',
  },
  {
    route: 'study',
    label: 'Study',
    description: 'Practice what you know',
    icon: 'study',
  },
  {
    route: 'progress',
    label: 'Progress',
    description: 'See your development',
    icon: 'progress',
  },
]
