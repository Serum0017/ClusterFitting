# from isochrones.mist import MISTEvolutionTrackGrid

# grid_tracks = MISTEvolutionTrackGrid()
# print(len(grid_tracks.df))
# grid_tracks.df.head()

# from isochrones import get_ichrone

# mist = get_ichrone('mist')
# eep = mist.get_eep(1.01, 9.76, 0.03, accurate=True)
# mist.interp_value([eep, 9.76, 0.03], ['Teff', 'logg', 'radius', 'density'])

# %matplotlib inline
import numpy as np
import matplotlib.pyplot as plt

from scripts import read_mist_models

iso = read_mist_models.ISO('MIST_iso_65ea8a5141abd.iso')

age_ind = iso.age_index(9.6) #returns the index for the desired age
logTeff = iso.isos[age_ind]['log_Teff']
logL = iso.isos[age_ind]['log_L']
plt.plot(logTeff, logL) 
plt.xlabel('log(Teff)')
plt.ylabel('log(L)')
plt.axis([5.2, 3.3, -4, 5])