﻿using System;

namespace NzbDrone.Core.MetadataSource.Trakt
{
    public class Ratings
    {
        public Decimal percentage { get; set; }
        public Int32 votes { get; set; }
        public Int32 loved { get; set; }
        public Int32 hated { get; set; }
    }
}
