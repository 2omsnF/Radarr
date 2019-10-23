using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.RootFolders;
using Radarr.Http.REST;

namespace Radarr.Api.V2.RootFolders
{
    public class RootFolderResource : RestResource
    {
        public string Name { get; set; }
        public string Path { get; set; }
        public bool Accessible { get; set; }
        public long? FreeSpace { get; set; }

        public int QualityProfileId { get; set; }

        public List<UnmappedFolder> UnmappedFolders { get; set; }
    }

    public static class RootFolderResourceMapper
    {
        public static RootFolderResource ToResource(this RootFolder model)
        {
            if (model == null) return null;

            return new RootFolderResource
            {
                Id = model.Id,

                Name = model.Path.GetCleanPath(), //Set Bogus for Testing UI
                Path = model.Path.GetCleanPath(),
                Accessible = model.Accessible,
                FreeSpace = model.FreeSpace,
                UnmappedFolders = model.UnmappedFolders,
                QualityProfileId = 1,
            };
        }

        public static RootFolder ToModel(this RootFolderResource resource)
        {
            if (resource == null) return null;

            return new RootFolder
            {
                Id = resource.Id,

                Path = resource.Path
                //Accessible
                //FreeSpace
                //UnmappedFolders
            };
        }

        public static List<RootFolderResource> ToResource(this IEnumerable<RootFolder> models)
        {
            return models.Select(ToResource).ToList();
        }
    }
}
